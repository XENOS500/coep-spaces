export function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
}
export function formatTime(value) {
  return new Date(value).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
}
export function campusTimestamp(date, time) {
  return new Date(date + "T" + time + ":00+05:30").toISOString();
}
export function campusToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
