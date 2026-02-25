export type PreviewTodoItem = {
  id: string;
  label: string;
  checked?: boolean;
  children?: readonly string[];
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
