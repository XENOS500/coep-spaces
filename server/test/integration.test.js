import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID } from "node:crypto";
import dns from "node:dns";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/user.js";
import Venue from "../src/models/venue.js";
import Booking from "../src/models/bookings.js";
import { seedVenues } from "../src/seed/seedVenues.js";
import originalVenues from "../src/seed/venues.json" with { type: "json" };

test("backend integration with an isolated MongoDB database", {
  skip: process.env.RUN_DB_TESTS !== "1" ? "Set RUN_DB_TESTS=1 to use MONGO_URI with a disposable test database" : false,
  timeout: 90000,
}, async t => {
  assert.ok(process.env.MONGO_URI, "MONGO_URI is required");
  assert.ok(process.env.JWT_SECRET, "JWT_SECRET is required");
  const dbName = "coep_integration_test_" + randomUUID().replaceAll("-", "");
  let server;
  try {
    dns.setServers(["8.8.8.8"]);
    await mongoose.connect(process.env.MONGO_URI, { dbName, serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
    await User.init();
    server = app.listen(0, "127.0.0.1");
    await new Promise(resolve => server.once("listening", resolve));
    const base = "http://127.0.0.1:" + server.address().port;
    const request = async (path, { method = "GET", token, body } = {}) => {
      const response = await fetch(base + "/api" + path, {
        method,
        headers: { ...(token ? { Authorization: "Bearer " + token } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: response.status, body: await response.json() };
    };
    const register = async email => {
      const result = await request("/auth/register", { method: "POST", body: { name: email.split("@")[0], email, password: "IntegrationPassword123!", role: "ADMIN" } });
      assert.equal(result.status, 201);
      assert.equal(result.body.user.role, "REQUESTER", "Registration cannot grant a privileged role");
      return result.body;
    };
    const requester = await register("requester@example.com");
    const other = await register("other@example.com");
    const admin = await register("admin@example.com");
    const approver = await register("approver@example.com");
    const otherApprover = await register("other-approver@example.com");
    await User.findByIdAndUpdate(admin.user.id, { role: "ADMIN" });
    await User.findByIdAndUpdate(otherApprover.user.id, { role: "APPROVER" });
    let venue, booking;
    const start = new Date(Date.now() + 3 * 86400000);
    start.setUTCHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 3600000);
    const body = () => ({ venueId: venue._id, eventName: "Integration event", purpose: "API integration test", contactInfo: "requester@example.com", studCount: 2, startTime: start.toISOString(), endTime: end.toISOString() });

    await t.test("health, login, wrong password, missing token, and role restrictions", async () => {
      assert.equal((await request("/health")).status, 200);
      assert.equal((await request("/auth/login", { method: "POST", body: { email: "requester@example.com", password: "IntegrationPassword123!" } })).status, 200);
      assert.equal((await request("/auth/login", { method: "POST", body: { email: "requester@example.com", password: "wrong" } })).status, 401);
      const deniedAdmin = await request("/auth/admin/login", { method: "POST", body: { email: "requester@example.com", password: "IntegrationPassword123!" } });
      assert.equal(deniedAdmin.status, 403);
      assert.equal(deniedAdmin.body.token, undefined);
      assert.equal((await request("/auth/admin/login", { method: "POST", body: { email: "admin@example.com", password: "wrong" } })).status, 401);
      const adminLogin = await request("/auth/admin/login", { method: "POST", body: { email: "admin@example.com", password: "IntegrationPassword123!" } });
      assert.equal(adminLogin.status, 200);
      assert.equal(adminLogin.body.user.role, "ADMIN");
      assert.equal((await request("/auth/me")).status, 401);
      assert.equal((await request("/auth/me", { token: "invalid" })).status, 401);
      assert.equal((await request("/auth/me", { token: requester.token })).body.user.id, requester.user.id);
      assert.equal((await request("/admin/venues", { token: requester.token })).status, 403);
      assert.equal((await request("/approvals/pending", { token: requester.token })).status, 403);
    });

    await t.test("admin promotes a registered user and persists venue details and assignment", async () => {
      assert.equal((await request("/admin/approvers", { method: "POST", token: admin.token, body: { email: "approver@example.com" } })).status, 200);
      const people = await request("/admin/approvers", { token: admin.token });
      assert.ok(people.body.approvers.some(person => person._id === approver.user.id));
      assert.ok(people.body.approvers.every(person => !person.passwordHash));
      const result = await request("/admin/venues", { method: "POST", token: admin.token, body: {
        name: "Integration venue", location: "Academic Complex", capacity: 72, facilities: ["Projector"],
        type: "Classroom", floor: "First floor", room: "101", image: "https://example.com/venue.jpg", approver: approver.user.id,
      } });
      assert.equal(result.status, 201);
      venue = result.body.venue;
      assert.equal(venue.approver._id, approver.user.id);
      assert.equal(venue.room, "101");
      assert.equal((await request("/venues/" + venue._id, { token: requester.token })).body.venue.name, venue.name);
      assert.equal((await request("/admin/venues/" + venue._id, { token: admin.token })).status, 200);
      assert.equal((await request("/admin/venues/" + venue._id, { method: "PATCH", token: admin.token, body: { approver: requester.user.id } })).status, 400);
    });

    await t.test("repeat seeding preserves venue IDs and approval assignments", async () => {
      const seed = [{ name: venue.name, location: venue.location, capacity: 72, facilities: ["Projector"], isActive: true }];
      await seedVenues(seed);
      await seedVenues(seed);
      assert.equal(await Venue.countDocuments(), 1);
      const saved = await Venue.findById(venue._id);
      assert.equal(saved.approver.toString(), approver.user.id);
      assert.equal(saved.room, "101");
    });

    await t.test("booking validation and availability", async () => {
      assert.equal((await request("/bookings", { method: "POST", token: requester.token, body: { ...body(), eventName: " " } })).status, 400);
      assert.equal((await request("/bookings", { method: "POST", token: requester.token, body: { ...body(), studCount: 73 } })).status, 400);
      assert.equal((await request("/bookings", { method: "POST", token: requester.token, body: { ...body(), endTime: new Date(start.getTime() - 3600000).toISOString() } })).status, 400);
      assert.equal((await request("/bookings", { method: "POST", token: approver.token, body: body() })).status, 403);
      assert.equal((await request("/bookings/not-an-id/cancel", { method: "PATCH", token: requester.token })).status, 400);
      const query = new URLSearchParams({ venueId: venue._id, start: start.toISOString(), end: end.toISOString() });
      assert.equal((await request("/bookings/availability?" + query, { token: requester.token })).body.available, true);
      const result = await request("/bookings", { method: "POST", token: requester.token, body: body() });
      assert.equal(result.status, 201);
      booking = result.body;
      assert.equal(booking.status, "PENDING");
      assert.equal((await request("/bookings", { method: "POST", token: requester.token, body: body() })).status, 409);
      assert.equal((await request("/bookings/availability?" + query, { token: requester.token })).body.available, false);
    });

    await t.test("booking ownership and assigned-approver permissions", async () => {
      const mine = await request("/bookings/my", { token: requester.token });
      assert.equal(mine.body[0].venue.name, venue.name);
      assert.equal((await request("/bookings/my", { token: other.token })).body.length, 0);
      assert.equal((await request("/bookings/" + booking._id + "/cancel", { method: "PATCH", token: other.token })).status, 403);
      assert.equal((await request("/approvals/pending", { token: otherApprover.token })).body.approvals.length, 0);
      assert.equal((await request("/approvals/" + booking._id, { method: "PATCH", token: otherApprover.token, body: { status: "APPROVED" } })).status, 403);
      const pending = await request("/approvals/pending", { token: approver.token });
      assert.equal(pending.body.approvals[0].requester.email, "requester@example.com");
      assert.equal(pending.body.approvals[0].venue.name, venue.name);
    });

    await t.test("approval, cancellation, rebooking, rejection, and persisted decisions", async () => {
      const path = "/approvals/" + booking._id;
      assert.equal((await request(path, { method: "PATCH", token: approver.token, body: { status: "APPROVED" } })).body.booking.status, "APPROVED");
      assert.equal((await request(path, { method: "PATCH", token: approver.token, body: { status: "REJECTED" } })).status, 409);
      assert.equal((await request("/bookings/" + booking._id + "/cancel", { method: "PATCH", token: requester.token })).body.status, "CANCELLED");
      const again = await request("/bookings", { method: "POST", token: requester.token, body: body() });
      assert.equal(again.status, 201);
      const rejected = await request("/approvals/" + again.body._id, { method: "PATCH", token: approver.token, body: { status: "REJECTED", rejectionReason: "Scheduling issue" } });
      assert.equal(rejected.body.booking.status, "REJECTED");
      assert.equal((await Booking.findById(again.body._id)).rejectionReason, "Scheduling issue");
    });

    await t.test("inactive venues remain editable by admins but cannot be booked", async () => {
      assert.equal((await request("/admin/venues/" + venue._id + "/deactivate", { method: "PATCH", token: admin.token })).status, 200);
      assert.equal((await request("/venues", { token: requester.token })).body.venues.length, 0);
      assert.equal((await request("/admin/venues", { token: admin.token })).body.venues.length, 1);
      assert.equal((await request("/bookings", { method: "POST", token: requester.token, body: body() })).status, 400);
      const result = await request("/admin/venues/" + venue._id, { method: "PATCH", token: admin.token, body: { isActive: true, room: "102" } });
      assert.equal(result.body.venue.isActive, true);
      assert.equal(result.body.venue.room, "102");
      assert.equal((await request("/venues", { token: requester.token })).body.venues.length, 1);
    });

    await t.test("frontend API services use real authenticated requests and map database fields", async () => {
      const originalFetch = globalThis.fetch;
      const originalStorage = globalThis.sessionStorage;
      const originalWindow = globalThis.window;
      const values = new Map([["coepToken", requester.token]]);
      globalThis.sessionStorage = {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key),
      };
      globalThis.window = new EventTarget();
      globalThis.fetch = (path, options) => originalFetch(base + path, options);
      try {
        const venueApi = await import("../../client/src/services/venueApi.js");
        const bookingApi = await import("../../client/src/services/bookingApi.js");
        const dates = await import("../../client/src/services/dates.js");
        const venues = await venueApi.fetchVenues();
        assert.equal(venues[0].id, venue._id);
        assert.equal(venues[0].building, venue.location);
        const mine = await bookingApi.fetchMyBookings();
        assert.equal(mine.length, 2);
        assert.ok(mine.every(item => item.venue === venue.name && item.attendees === 2));
        assert.equal(dates.campusTimestamp("2026-11-03", "10:00"), "2026-11-03T04:30:00.000Z");
        values.set("coepToken", admin.token);
        assert.equal((await venueApi.fetchAdminVenue(venue._id)).approverId, approver.user.id);
        values.set("coepToken", "expired-or-invalid");
        await assert.rejects(venueApi.fetchVenues(), { status: 401 });
        assert.equal(values.has("coepToken"), false);
      } finally {
        globalThis.fetch = originalFetch;
        globalThis.sessionStorage = originalStorage;
        globalThis.window = originalWindow;
      }
    });

    await t.test("all original venues seed successfully without duplicates", async () => {
      await seedVenues(originalVenues);
      await seedVenues(originalVenues);
      assert.equal(await Venue.countDocuments(), originalVenues.length + 1);
      assert.equal(await Venue.countDocuments({ name: "NC 01" }), 1);
    });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    // Never drop the database selected by the user's connection string.
    if (mongoose.connection.readyState === 1 && mongoose.connection.name === dbName && dbName.startsWith("coep_integration_test_")) {
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
  }
});
