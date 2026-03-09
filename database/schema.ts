import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const oauthAccounts = sqliteTable("oauth_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // fk -> users.id
  provider: text("provider").notNull(), // "google"
  providerUserId: text("provider_user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: integer("expires_at"), // epoch seconds
});

export const userExt = sqliteTable("user_ext", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  onboardingStatus: text("onboarding_status").notNull().default("pending"), // "pending" | "choice" | "creating" | "complete"
  onboardingChoice: text("onboarding_choice"), // "vm" | "ai" | null
  onboardingWelcome: text("onboarding_welcome").notNull().default("pending"), // "pending" | "complete"
  kycStatus: text("kyc_status").notNull().default("pending"), // "pending" | "success" | "fail"
  tier: text("tier").notNull().default("trial"), // "free" | "plus" | "vip" | "trial"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const task = sqliteTable(
  "task",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: text("parent_id").references((): AnySQLiteColumn => task.id, {
      onDelete: "cascade",
    }),
    depth: integer("depth").notNull().default(0),
    status: text("status").notNull().default("todo"),
    body: text("body").notNull(),
    taskDate: text("task_date").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    rolloverCount: integer("rollover_count").notNull().default(0),
    lastRolloverDate: text("last_rollover_date"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    archivedAt: integer("archived_at", { mode: "timestamp" }),
  },
  (table) => ({
    userDateIdx: index("task_user_date_idx").on(table.userId, table.taskDate),
    parentIdx: index("task_parent_idx").on(table.parentId),
    orderIdx: index("task_order_idx").on(
      table.userId,
      table.taskDate,
      table.parentId,
      table.sortOrder,
    ),
    statusIdx: index("task_status_idx").on(table.userId, table.status),
  }),
);

export const note = sqliteTable(
  "note",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    depth: integer("depth").notNull().default(0),
    body: text("body").notNull(),
    noteDate: text("note_date").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userDateIdx: index("note_user_date_idx").on(table.userId, table.noteDate),
    parentIdx: index("note_parent_idx").on(table.parentId),
    orderIdx: index("note_order_idx").on(
      table.userId,
      table.noteDate,
      table.parentId,
      table.sortOrder,
    ),
  }),
);

export const label = sqliteTable(
  "label",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    color: text("color").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userUpdatedIdx: index("label_user_updated_idx").on(table.userId, table.updatedAt),
    userNormalizedUq: uniqueIndex("label_user_normalized_name_uq").on(
      table.userId,
      table.normalizedName,
    ),
  }),
);

export const taskLabel = sqliteTable(
  "task_label",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    taskId: text("task_id")
      .notNull()
      .references(() => task.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => label.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userTaskLabelUq: uniqueIndex("task_label_user_task_label_uq").on(
      table.userId,
      table.taskId,
      table.labelId,
    ),
    userTaskIdx: index("task_label_user_task_idx").on(table.userId, table.taskId),
    userLabelIdx: index("task_label_user_label_idx").on(table.userId, table.labelId),
  }),
);

export const noteLabel = sqliteTable(
  "note_label",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    noteId: text("note_id")
      .notNull()
      .references(() => note.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => label.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userNoteLabelUq: uniqueIndex("note_label_user_note_label_uq").on(
      table.userId,
      table.noteId,
      table.labelId,
    ),
    userNoteIdx: index("note_label_user_note_idx").on(table.userId, table.noteId),
    userLabelIdx: index("note_label_user_label_idx").on(table.userId, table.labelId),
  }),
);

export const editorDraft = sqliteTable(
  "editor_draft",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mode: text("mode").notNull(),
    editorDate: text("editor_date").notNull(),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userDateIdx: index("editor_draft_user_date_idx").on(
      table.userId,
      table.editorDate,
    ),
    userModeDateUq: uniqueIndex("editor_draft_user_mode_date_uq").on(
      table.userId,
      table.mode,
      table.editorDate,
    ),
  }),
);

export const googleCalendarPreference = sqliteTable(
  "google_calendar_preference",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull().default("google"),
    providerAccountId: text("provider_account_id").notNull(),
    calendarId: text("calendar_id").notNull(),
    isVisible: integer("is_visible", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userProviderAccountIdx: index("gcal_pref_user_provider_account_idx").on(
      table.userId,
      table.providerId,
      table.providerAccountId,
    ),
    userCalendarUq: uniqueIndex("gcal_pref_user_account_calendar_uq").on(
      table.userId,
      table.providerId,
      table.providerAccountId,
      table.calendarId,
    ),
  }),
);

export const workingHoursPreference = sqliteTable("working_hours_preference", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  scheduleJson: text("schedule_json").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const userScheduleProfile = sqliteTable("user_schedule_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  timeZone: text("time_zone").notNull(),
  paceMultiplier: real("pace_multiplier").notNull().default(1),
  successCount: integer("success_count").notNull().default(0),
  rescheduleCount: integer("reschedule_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const taskSchedule = sqliteTable(
  "task_schedule",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    taskId: text("task_id")
      .notNull()
      .references(() => task.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("scheduled"),
    calendarId: text("calendar_id"),
    eventId: text("event_id"),
    scheduledStart: integer("scheduled_start", { mode: "timestamp" }),
    scheduledEnd: integer("scheduled_end", { mode: "timestamp" }),
    estimatedMinutes: integer("estimated_minutes"),
    aiCategory: text("ai_category"),
    aiConfidence: real("ai_confidence"),
    autoRescheduleCount: integer("auto_reschedule_count").notNull().default(0),
    lastScheduledLocalDate: text("last_scheduled_local_date"),
    lastErrorCode: text("last_error_code"),
    lastErrorMessage: text("last_error_message"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userTaskUq: uniqueIndex("task_schedule_user_task_uq").on(
      table.userId,
      table.taskId,
    ),
    userStatusIdx: index("task_schedule_user_status_idx").on(
      table.userId,
      table.status,
    ),
    userLocalDateIdx: index("task_schedule_user_local_date_idx").on(
      table.userId,
      table.lastScheduledLocalDate,
    ),
  }),
);

/**
 * Better Auth Types
 */
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type UserExt = typeof userExt.$inferSelect;
export type NewUserExt = typeof userExt.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export type Task = typeof task.$inferSelect;
export type NewTask = typeof task.$inferInsert;

export type Note = typeof note.$inferSelect;
export type NewNote = typeof note.$inferInsert;

export type Label = typeof label.$inferSelect;
export type NewLabel = typeof label.$inferInsert;

export type TaskLabel = typeof taskLabel.$inferSelect;
export type NewTaskLabel = typeof taskLabel.$inferInsert;

export type NoteLabel = typeof noteLabel.$inferSelect;
export type NewNoteLabel = typeof noteLabel.$inferInsert;

export type EditorDraft = typeof editorDraft.$inferSelect;
export type NewEditorDraft = typeof editorDraft.$inferInsert;

export type GoogleCalendarPreference = typeof googleCalendarPreference.$inferSelect;
export type NewGoogleCalendarPreference =
  typeof googleCalendarPreference.$inferInsert;

export type WorkingHoursPreference = typeof workingHoursPreference.$inferSelect;
export type NewWorkingHoursPreference =
  typeof workingHoursPreference.$inferInsert;

export type UserScheduleProfile = typeof userScheduleProfile.$inferSelect;
export type NewUserScheduleProfile = typeof userScheduleProfile.$inferInsert;

export type TaskSchedule = typeof taskSchedule.$inferSelect;
export type NewTaskSchedule = typeof taskSchedule.$inferInsert;

export type UserTier = "free" | "plus" | "vip" | "trial";
