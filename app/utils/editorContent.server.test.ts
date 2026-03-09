import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTaskDoc,
  extractTasksFromDoc,
} from "./editorContent.server.js";

const NOW = new Date("2026-03-06T09:00:00.000Z");

test("extractTasksFromDoc maps Yoopta checked state to task status and parent depth", () => {
  const doc = {
    taskRoot: {
      id: "taskRoot",
      type: "TodoList",
      value: [
        {
          id: "elemRoot",
          type: "todo-list",
          children: [{ text: "Parent task" }],
          props: { checked: false, nodeType: "block" },
        },
      ],
      meta: { order: 0, depth: 0 },
    },
    taskChild: {
      id: "taskChild",
      type: "TodoList",
      value: [
        {
          id: "elemChild",
          type: "todo-list",
          children: [{ text: "Child task" }],
          props: { checked: true, nodeType: "block" },
        },
      ],
      meta: { order: 1, depth: 1 },
    },
    noteLike: {
      id: "noteLike",
      type: "BulletedList",
      value: [
        {
          id: "elemNote",
          type: "bulleted-list",
          children: [{ text: "Ignored in todos mode" }],
          props: { nodeType: "block" },
        },
      ],
      meta: { order: 2, depth: 0 },
    },
  } as any;

  const rows = extractTasksFromDoc(doc, {
    userId: "user-1",
    dateKey: "2026-03-06",
    now: NOW,
  });

  assert.equal(rows.length, 2);

  const root = rows.find((row) => row.id === "taskRoot");
  const child = rows.find((row) => row.id === "taskChild");

  assert.ok(root);
  assert.ok(child);
  assert.equal(root.status, "todo");
  assert.equal(root.parentId, null);
  assert.equal(root.depth, 0);
  assert.equal(child.status, "done");
  assert.equal(child.parentId, "taskRoot");
  assert.equal(child.depth, 1);
});

test("extractTasksFromDoc ignores empty todo content", () => {
  const doc = {
    emptyTask: {
      id: "emptyTask",
      type: "TodoList",
      value: [
        {
          id: "elemEmpty",
          type: "todo-list",
          children: [{ text: "   " }],
          props: { checked: false, nodeType: "block" },
        },
      ],
      meta: { order: 0, depth: 0 },
    },
  } as any;

  const rows = extractTasksFromDoc(doc, {
    userId: "user-1",
    dateKey: "2026-03-06",
    now: NOW,
  });

  assert.equal(rows.length, 0);
});

test("buildTaskDoc preserves done/todo checkbox state", () => {
  const rows = [
    {
      id: "todo-task",
      userId: "user-1",
      parentId: null,
      depth: 0,
      status: "todo",
      body: JSON.stringify([{ text: "Todo task" }]),
      taskDate: "2026-03-06",
      sortOrder: 0,
      rolloverCount: 0,
      lastRolloverDate: null,
      createdAt: NOW,
      updatedAt: NOW,
      completedAt: null,
      archivedAt: null,
    },
    {
      id: "done-task",
      userId: "user-1",
      parentId: null,
      depth: 0,
      status: "done",
      body: JSON.stringify([{ text: "Done task" }]),
      taskDate: "2026-03-06",
      sortOrder: 1,
      rolloverCount: 0,
      lastRolloverDate: null,
      createdAt: NOW,
      updatedAt: NOW,
      completedAt: NOW,
      archivedAt: null,
    },
  ] as any;

  const doc = buildTaskDoc(rows);
  assert.ok(doc);
  assert.equal((doc["todo-task"].value[0] as any).props.checked, false);
  assert.equal((doc["done-task"].value[0] as any).props.checked, true);
});
