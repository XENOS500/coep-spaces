# COEP Spaces

Campus venue booking with React, Express and MongoDB. Accounts, venues, requests,
venue assignments and approval decisions are stored in MongoDB. The browser keeps
only the signed-in session; venue and booking data come from the API.

## Start locally

1. In server/, install dependencies with npm install.
2. Set server/.env using server/.env.example. Supply MONGO_URI and JWT_SECRET.
3. Run npm run seed in server/ to load the 55 original campus venues. Matching
   names and locations are updated in place, preserving venue IDs and approver
   assignments. The seed does not remove unrelated venues or existing bookings.
4. Run npm run dev in server/ (port 5000 by default).
5. In client/, install dependencies and run npm run dev. Open the URL Vite prints.
   Requests to /api are proxied to the backend during local development.

For deployment, set VITE_API_URL when building the frontend if the API is hosted
on another origin. Set CLIENT_URL on the backend to the frontend's origin. With
same-origin deployment, route /api to Express and serve the React application
for frontend paths. Never put JWT_SECRET or MONGO_URI in frontend environment files.

## Accounts and approvals

Registration always creates a REQUESTER. There are no default administrator
credentials. To bootstrap your administrator, register normally, change that
account's role to ADMIN in MongoDB Compass, then sign in again.

An administrator can add an approver using an existing registered email on the
Manage Venues page. Edit a venue to assign that approver. A user must have the
APPROVER role before they can be assigned. Approvers see and decide only pending
requests for venues assigned to their account. Unassigned venues can receive
requests; those requests remain pending until an approver is assigned.

Administrators can create and edit venues, facilities, photos and assignments,
and deactivate or reactivate venues. Inactive venues remain visible to admins
and existing bookings are retained. Venue photos are optional; an absent photo
is shown as a placeholder rather than an unrelated campus image.

Requesters can check availability, submit requests, view their own bookings and
cancel future pending or approved bookings. Times are entered and displayed in
India time and stored as timestamps. The backend checks capacity, the 30-day
booking window and overlapping pending/approved bookings.

## Checks

In client/:

    npm run lint
    npm run build

In server/, the MongoDB integration suite is opt-in. In PowerShell:

    $env:RUN_DB_TESTS = '1'
    npm test

The suite uses MONGO_URI but overrides the database name with a unique
coep_integration_test_ prefix, then removes only that generated database. The
MongoDB account must be allowed to create and drop a separate test database.
You can point MONGO_URI at a separate local MongoDB instance for testing:

    $env:MONGO_URI = 'mongodb://127.0.0.1:27017'
    $env:JWT_SECRET = 'local-test-secret-only'
    $env:RUN_DB_TESTS = '1'
    npm test

The tests cover authentication, role restrictions, venue editing and assignments,
booking validation and conflicts, ownership, approval/rejection, cancellation,
reactivation, frontend API field mapping and repeat seeding of the original venues.
