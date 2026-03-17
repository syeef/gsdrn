import type { YooptaContentValue } from "@yoopta/editor";

export type PendingTodoToggle = {
  blockId: string;
  elementId: string;
  checked: boolean;
};

export const applyPendingTodoToggles = (
  content: YooptaContentValue,
  pendingToggles: Iterable<PendingTodoToggle>,
): YooptaContentValue => {
  let nextContent = content;
  let clonedContent = false;

  for (const pending of pendingToggles) {
    const block = nextContent[pending.blockId];
    if (!block || block.type !== "TodoList") continue;

    let blockChanged = false;
    const nextValue = block.value.map((entry: any, index: number) => {
      const matchesElement =
        entry?.id === pending.elementId ||
        (index === 0 && typeof entry?.id !== "string");
      if (!matchesElement) return entry;

      const currentChecked = Boolean(entry?.props?.checked);
      if (currentChecked === pending.checked) return entry;
      blockChanged = true;

      return {
        ...entry,
        props: {
          ...(entry?.props ?? {}),
          checked: pending.checked,
        },
      };
    });

    if (!blockChanged) continue;

    if (!clonedContent) {
      nextContent = { ...nextContent };
      clonedContent = true;
    }

    nextContent[pending.blockId] = {
      ...block,
      value: nextValue,
    };
  }

  return nextContent;
};
