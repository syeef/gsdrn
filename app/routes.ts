import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("components/layouts/blank/blank.tsx", [
    index("routes/index.tsx"),
    route("/home", "routes/home.tsx"),
    route("/signup", "routes/auth/signup.tsx"),
    route("/login", "routes/auth/login.tsx"),
    layout("components/layouts/app-shell/app-shell.tsx", [
      route("/today", "routes/app.today.tsx"),
      route("/app", "routes/app.tsx"),
      route("/preferences", "routes/preferences/preferences.tsx"),
      route("/tasks", "routes/tasks/tasks.tsx"),
      route("/notes", "routes/notes/notes.tsx"),
      route("/:date", "routes/app.date.tsx"),
    ]),
  ]),

  // APIs
  // Auth
  route("/signout", "routes/auth/signout.ts"),
  route("/api/auth/*", "routes/auth/auth.ts"),

  // Editor
  route("/api/editorDraft", "routes/api/editorDraft.ts"),
  route("/api/editorContent", "routes/api/editorContent.ts"),
  route("/api/taskSchedule", "routes/api/taskSchedule.ts"),
  route("/api/labels", "routes/api/labels.ts"),
  route("/api/labelAssignments", "routes/api/labelAssignments.ts"),

  // Google Calendar
  route(
    "/api/getGoogleCalendarEvents",
    "routes/api/getGoogleCalendarEvents.ts",
  ),
  route(
    "/api/googleCalendarPreferences",
    "routes/api/googleCalendarPreferences.ts",
  ),
  route(
    "/api/workingHoursPreferences",
    "routes/api/workingHoursPreferences.ts",
  ),
] satisfies RouteConfig;
