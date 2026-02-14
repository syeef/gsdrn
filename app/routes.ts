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
    // route("/app/today", "routes/app.today.tsx"),
    route("/today", "routes/app.today.tsx"),
    // route("/app/:date", "routes/app.date.tsx"),
    route("/app", "routes/app.tsx"),
    route("/signup", "routes/auth/signup.tsx"),
    route("/login", "routes/auth/login.tsx"),
    route("/:date", "routes/app.date.tsx"),
  ]),

  // APIs
  // Auth
  route("/signout", "routes/auth/signout.ts"),
  route("/api/auth/*", "routes/auth/auth.ts"),

  // Editor
  route("/api/editorDraft", "routes/api/editorDraft.ts"),
  route("/api/editorContent", "routes/api/editorContent.ts"),

  // Google Calendar
  route(
    "/api/getGoogleCalendarEvents",
    "routes/api/getGoogleCalendarEvents.ts",
  ),
] satisfies RouteConfig;
