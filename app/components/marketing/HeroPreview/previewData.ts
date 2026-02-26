export type PreviewTodoItem = {
  id: string;
  label: string;
  checked?: boolean;
  children?: readonly string[];
};

export type PreviewCalendarEventSeed = {
  id: string;
  title: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
};

export const TODO_ITEMS: readonly PreviewTodoItem[] = [
  {
    id: "t1",
    label: "Plan user research session",
    children: ["Prepare script", "Prepare prototype to be used"],
  },
  { id: "t2", label: "Provide feedback on Hassan's designs", checked: true },
  { id: "t3", label: "Complete slides for Weekly All-Hands" },
  { id: "t4", label: "Complete README document for new joiner" },
];

export const NOTE_ITEMS = [
  "Review Release Notes for upcoming update",
  "Call Layla to discuss onboarding copy",
  "Draft launch tweet variations",
  "Pull screenshots for homepage",
] as const;

export const PREVIEW_DYNAMIC_EVENT = {
  id: "setup-tickatana",
  title: "Setup Tickatana",
  durationMinutes: 20,
} as const;

export const PREVIEW_CALENDAR_EVENTS: readonly PreviewCalendarEventSeed[] = [
  {
    id: "gym",
    title: "Gym",
    startHour: 6,
    startMinute: 30,
    endHour: 8,
    endMinute: 0,
  },
  {
    id: "focus-time",
    title: "Focus Time",
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
  },
  {
    id: "design-review",
    title: "Design Review",
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
  },
] as const;
