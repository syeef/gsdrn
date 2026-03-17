import assert from "node:assert/strict";
import test from "node:test";
import { applyPendingTodoToggles } from "./editorContent.client.js";

test("applyPendingTodoToggles patches stale unchecked content before save", () => {
  const content = {
    taskA: {
      id: "taskA",
      type: "TodoList",
      value: [
        {
          id: "elemA",
          type: "todo-list",
          children: [{ text: "Ship prod fix" }],
          props: { checked: false, nodeType: "block" },
        },
      ],
      meta: { order: 0, depth: 0 },
    },
  } as any;

  const result = applyPendingTodoToggles(content, [
    {
      blockId: "taskA",
      elementId: "elemA",
      checked: true,
    },
  ]);

  assert.notEqual(result, content);
  assert.equal((result.taskA.value[0] as any).props.checked, true);
  assert.equal((content.taskA.value[0] as any).props.checked, false);
});

test("applyPendingTodoToggles ignores blocks that are already in the expected state", () => {
  const content = {
    taskA: {
      id: "taskA",
      type: "TodoList",
      value: [
        {
          id: "elemA",
          type: "todo-list",
          children: [{ text: "Ship prod fix" }],
          props: { checked: true, nodeType: "block" },
        },
      ],
      meta: { order: 0, depth: 0 },
    },
  } as any;

  const result = applyPendingTodoToggles(content, [
    {
      blockId: "taskA",
      elementId: "elemA",
      checked: true,
    },
  ]);

  assert.equal(result, content);
});
