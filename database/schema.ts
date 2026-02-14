import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
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
    parentId: text("parent_id").references(() => task.id, {
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

export type EditorDraft = typeof editorDraft.$inferSelect;
export type NewEditorDraft = typeof editorDraft.$inferInsert;
