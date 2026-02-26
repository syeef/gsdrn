import * as React from "react";
import { motion, type Transition } from "motion/react";
import styles from "./HeroPreview.module.css";
import PreviewNotes from "./PreviewNotes";
import PreviewSceneShell from "./PreviewSceneShell";
import PreviewTodo from "./PreviewTodo";
import { NOTE_ITEMS, TODO_ITEMS } from "./previewData";

export type HeroPreviewSceneState = "overview" | "todos" | "notes";

type HeroPreviewProps = {
  dateKey?: string;
  scene: HeroPreviewSceneState;
  transition: Transition;
  height?: number | string;
};

type PreviewAppProps = {
  dateKey: string;
  transition: Transition;
};

type PreviewSceneContentProps = {
  transition: Transition;
};

type PreviewOverviewContentProps = PreviewSceneContentProps & {
  dateKey: string;
};

type PreviewCalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
};

type PreviewCalendarLayoutEvent = PreviewCalendarEvent & {
  top: number;
  height: number;
  timeLabel: string;
};

const PREVIEW_CALENDAR_HOUR_HEIGHT = 34;
const PREVIEW_CALENDAR_HOURS = Array.from({ length: 24 }, (_, index) => index);
const PREVIEW_CALENDAR_MINUTE_HEIGHT = PREVIEW_CALENDAR_HOUR_HEIGHT / 60;
const PREVIEW_CALENDAR_GRID_HEIGHT =
  PREVIEW_CALENDAR_HOURS.length * PREVIEW_CALENDAR_HOUR_HEIGHT;
const PREVIEW_DYNAMIC_EVENT_DURATION_MINUTES = 20;

const formatPreviewHourLabel = (hour: number) =>
  `${hour.toString().padStart(2, "0")}:00`;

const setTimeOnDate = (baseDate: Date, hour: number, minute: number) => {
  const next = new Date(baseDate);
  next.setHours(hour, minute, 0, 0);
  return next;
};

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

const getStartOfDayForDateKey = (dateKey: string) => {
  const parsed = new Date(`${dateKey}T12:00:00`);
  const base = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  base.setHours(0, 0, 0, 0);
  return base;
};

const intervalsOverlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
  aStart < bEnd && aEnd > bStart;

function buildPreviewCalendarEvents(dateKey: string, now: Date) {
  const dayStart = getStartOfDayForDateKey(dateKey);
  const timeFormatter = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dynamicStart = new Date(now);
  dynamicStart.setSeconds(0, 0);
  const dynamicEnd = addMinutes(
    dynamicStart,
    PREVIEW_DYNAMIC_EVENT_DURATION_MINUTES,
  );

  const fixedCandidates: PreviewCalendarEvent[] = [
    {
      id: "gym",
      title: "Gym",
      start: setTimeOnDate(dayStart, 6, 30),
      end: setTimeOnDate(dayStart, 8, 0),
    },
    {
      id: "focus-time",
      title: "Focus Time",
      start: setTimeOnDate(dayStart, 10, 0),
      end: setTimeOnDate(dayStart, 12, 0),
    },
    {
      id: "design-review",
      title: "Design Review",
      start: setTimeOnDate(dayStart, 14, 0),
      end: setTimeOnDate(dayStart, 15, 0),
    },
  ];

  const placedEvents: PreviewCalendarEvent[] = [
    {
      id: "setup-tickatana",
      title: "Setup Tickatana",
      start: dynamicStart,
      end: dynamicEnd,
    },
  ];

  for (const event of fixedCandidates) {
    const durationMs = Math.max(event.end.getTime() - event.start.getTime(), 0);
    let nextStart = new Date(event.start);
    let nextEnd = new Date(nextStart.getTime() + durationMs);

    let hasCollision = true;
    while (hasCollision) {
      hasCollision = false;
      for (const placed of placedEvents) {
        if (!intervalsOverlap(nextStart, nextEnd, placed.start, placed.end)) {
          continue;
        }

        nextStart = new Date(placed.end);
        nextStart.setSeconds(0, 0);
        nextEnd = new Date(nextStart.getTime() + durationMs);
        hasCollision = true;
      }
    }

    placedEvents.push({
      ...event,
      start: nextStart,
      end: nextEnd,
    });
  }

  const layoutEvents = placedEvents
    .slice()
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((event) => {
      const startMinutes = Math.max(
        0,
        (event.start.getTime() - dayStart.getTime()) / 60000,
      );
      const endMinutes = Math.min(
        24 * 60,
        (event.end.getTime() - dayStart.getTime()) / 60000,
      );
      const durationMinutes = Math.max(endMinutes - startMinutes, 12);

      return {
        ...event,
        top: startMinutes * PREVIEW_CALENDAR_MINUTE_HEIGHT,
        height: durationMinutes * PREVIEW_CALENDAR_MINUTE_HEIGHT,
        timeLabel: `${timeFormatter.format(event.start)} - ${timeFormatter.format(
          event.end,
        )}`,
      } satisfies PreviewCalendarLayoutEvent;
    });

  const nowOffset =
    (now.getHours() * 60 + now.getMinutes()) * PREVIEW_CALENDAR_MINUTE_HEIGHT;

  return {
    dayStart,
    layoutEvents,
    nowOffset,
  };
}

function formatPreviewDate(dateKey?: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function PreviewApp({ dateKey, transition }: PreviewAppProps) {
  const displayDate = React.useMemo(
    () => formatPreviewDate(dateKey),
    [dateKey],
  );

  return (
    <PreviewSceneShell
      sceneKey="overview"
      heading={displayDate}
      transition={transition}
    >
      <PreviewOverviewContent dateKey={dateKey} transition={transition} />
    </PreviewSceneShell>
  );
}

export { PreviewTodo, PreviewNotes };

function PreviewCalendarContent({
  dateKey,
  transition,
}: PreviewOverviewContentProps) {
  const timelineScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [nowMinuteTick, setNowMinuteTick] = React.useState(() => Date.now());

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMinuteTick(Date.now());
    }, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const now = React.useMemo(() => new Date(nowMinuteTick), [nowMinuteTick]);

  const { layoutEvents, nowOffset } = React.useMemo(
    () => buildPreviewCalendarEvents(dateKey, now),
    [dateKey, now],
  );

  React.useEffect(() => {
    const el = timelineScrollRef.current;
    if (!el) return;

    const viewportHeight = el.clientHeight;
    if (viewportHeight <= 0) return;

    const targetFromTop = viewportHeight * 0.45;
    const maxScrollTop = Math.max(
      0,
      PREVIEW_CALENDAR_GRID_HEIGHT - viewportHeight,
    );
    const nextScrollTop = Math.max(
      0,
      Math.min(nowOffset - targetFromTop, maxScrollTop),
    );

    el.scrollTop = nextScrollTop;
  }, [nowOffset]);

  return (
    <motion.article
      className={styles.previewCalendarPanel}
      transition={transition}
    >
      <div className={styles.previewCalendarTimeline}>
        <div
          className={styles.previewCalendarTimelineScroll}
          ref={timelineScrollRef}
        >
          <div
            className={styles.previewCalendarHourLabels}
            style={{ height: PREVIEW_CALENDAR_GRID_HEIGHT }}
          >
            {PREVIEW_CALENDAR_HOURS.map((hour) => (
              <div key={hour} className={styles.previewCalendarHourLabel}>
                {formatPreviewHourLabel(hour)}
              </div>
            ))}
          </div>
          <div
            className={styles.previewCalendarGrid}
            style={{ height: PREVIEW_CALENDAR_GRID_HEIGHT }}
          >
            {PREVIEW_CALENDAR_HOURS.map((hour) => (
              <div key={hour} className={styles.previewCalendarHourRow} />
            ))}
            <div className={styles.previewCalendarEventsLayer}>
              {layoutEvents.map((event) => (
                <div
                  key={event.id}
                  className={styles.previewCalendarEventCard}
                  style={
                    {
                      top: `${event.top}px`,
                      height: `${event.height}px`,
                    } as React.CSSProperties
                  }
                >
                  <div className={styles.previewCalendarEventHeader}>
                    <span className={styles.previewCalendarEventTitle}>
                      {event.title}
                    </span>
                    <span className={styles.previewCalendarEventTime}>
                      {event.timeLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={styles.previewCalendarNowLine}
              style={{ top: `${nowOffset}px` }}
            >
              <span className={styles.previewCalendarNowDot} />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function PreviewOverviewContent({
  dateKey,
  transition,
}: PreviewOverviewContentProps) {
  return (
    <motion.div
      className={styles.previewOverviewLayout}
      transition={transition}
    >
      <PreviewCalendarContent dateKey={dateKey} transition={transition} />
      <motion.div
        className={styles.previewEditorsStack}
        transition={transition}
      >
        <motion.section
          className={styles.previewEditorSection}
          transition={transition}
        >
          <motion.div
            className={styles.previewEditorTitle}
            transition={transition}
          >
            Tasks
          </motion.div>
          <motion.div
            className={styles.previewEditorBody}
            transition={transition}
          >
            <ul className={styles.previewTodoList}>
              {TODO_ITEMS.map((item) => (
                <li key={item.id} className={styles.previewTodoItem}>
                  <span
                    className={[
                      styles.previewTodoCheckbox,
                      item.checked ? styles.previewTodoCheckboxChecked : "",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  <span
                    className={[
                      styles.previewTodoText,
                      item.checked ? styles.previewTodoTextDone : "",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.section>
        <motion.section
          className={styles.previewEditorSection}
          transition={transition}
        >
          <motion.div
            className={styles.previewEditorTitle}
            transition={transition}
          >
            Notes
          </motion.div>
          <motion.div
            className={styles.previewEditorBody}
            transition={transition}
          >
            <ul className={styles.previewNotesList}>
              {NOTE_ITEMS.slice(0, 2).map((item) => (
                <li key={item} className={styles.previewNotesItem}>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.section>
      </motion.div>
    </motion.div>
  );
}

function PreviewTodoContent({ transition }: PreviewSceneContentProps) {
  return (
    <motion.ul
      className={[styles.previewTodoList, styles.previewTodoListPanel].join(
        " ",
      )}
      transition={transition}
    >
      {TODO_ITEMS.map((item) => (
        <li key={item.id} className={styles.previewTodoItemRow}>
          <div className={styles.previewTodoItem}>
            <span
              className={[
                styles.previewTodoCheckbox,
                item.checked ? styles.previewTodoCheckboxChecked : "",
              ].join(" ")}
              aria-hidden="true"
            />
            <span
              className={[
                styles.previewTodoText,
                item.checked ? styles.previewTodoTextDone : "",
              ].join(" ")}
            >
              {item.label}
            </span>
          </div>
          {item.children && item.children.length > 0 ? (
            <ul className={styles.previewTodoChildren}>
              {item.children.map((child) => (
                <li
                  key={`${item.id}-${child}`}
                  className={styles.previewTodoChild}
                >
                  {child}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </motion.ul>
  );
}

function PreviewNotesContent({ transition }: PreviewSceneContentProps) {
  return (
    <motion.section
      className={styles.previewEditorSection}
      transition={transition}
    >
      {/* <motion.div className={styles.previewEditorTitle} transition={transition}>
        Notes hello
      </motion.div> */}
      <motion.div className={styles.previewEditorBody} transition={transition}>
        <ul className={styles.previewNotesList}>
          {NOTE_ITEMS.map((item) => (
            <li key={item} className={styles.previewNotesItem}>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.section>
  );
}

export default function HeroPreview({
  dateKey,
  scene,
  transition,
  height,
}: HeroPreviewProps) {
  const resolvedDateKey = dateKey ?? "";

  const heading =
    scene === "overview"
      ? formatPreviewDate(resolvedDateKey)
      : scene === "todos"
        ? "Tasks"
        : "Notes";

  const viewportStyle =
    height == null
      ? undefined
      : ({
          ["--preview-viewport-height" as any]:
            typeof height === "number" ? `${height}px` : height,
        } as React.CSSProperties);

  return (
    <div className={styles.previewViewport} style={viewportStyle}>
      <PreviewSceneShell
        sceneKey={scene}
        heading={heading}
        transition={transition}
      >
        {scene === "overview" ? (
          <PreviewOverviewContent
            dateKey={resolvedDateKey}
            transition={transition}
          />
        ) : scene === "todos" ? (
          <PreviewTodoContent transition={transition} />
        ) : (
          <PreviewNotesContent transition={transition} />
        )}
      </PreviewSceneShell>
    </div>
  );
}
