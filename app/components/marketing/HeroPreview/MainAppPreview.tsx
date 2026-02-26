import * as React from "react";
import { motion, type Transition } from "motion/react";
import styles from "./MainAppPreview.module.css";
import PreviewSceneShell from "./PreviewSceneShell";
import PreviewViewport from "./PreviewViewport";
import {
  NOTE_ITEMS,
  PREVIEW_CALENDAR_EVENTS,
  PREVIEW_DYNAMIC_EVENT,
  TODO_ITEMS,
} from "./previewData";

type MainAppPreviewProps = {
  dateKey?: string;
  transition?: Transition;
  height?: number | string;
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
  const dynamicEnd = addMinutes(dynamicStart, PREVIEW_DYNAMIC_EVENT.durationMinutes);

  const fixedCandidates: PreviewCalendarEvent[] = PREVIEW_CALENDAR_EVENTS.map(
    (event) => ({
      id: event.id,
      title: event.title,
      start: setTimeOnDate(dayStart, event.startHour, event.startMinute),
      end: setTimeOnDate(dayStart, event.endHour, event.endMinute),
    }),
  );

  const placedEvents: PreviewCalendarEvent[] = [
    {
      id: PREVIEW_DYNAMIC_EVENT.id,
      title: PREVIEW_DYNAMIC_EVENT.title,
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

function PreviewCalendar({ dateKey, transition }: MainAppPreviewProps) {
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
    () => buildPreviewCalendarEvents(dateKey ?? "", now),
    [dateKey, now],
  );

  React.useEffect(() => {
    const el = timelineScrollRef.current;
    if (!el) return;

    const viewportHeight = el.clientHeight;
    if (viewportHeight <= 0) return;

    const targetFromTop = viewportHeight * 0.45;
    const maxScrollTop = Math.max(0, PREVIEW_CALENDAR_GRID_HEIGHT - viewportHeight);
    const nextScrollTop = Math.max(
      0,
      Math.min(nowOffset - targetFromTop, maxScrollTop),
    );

    el.scrollTop = nextScrollTop;
  }, [nowOffset]);

  return (
    <motion.article className={styles.calendarPanel} transition={transition}>
      <div className={styles.calendarTimeline}>
        <div className={styles.calendarTimelineScroll} ref={timelineScrollRef}>
          <div
            className={styles.calendarHourLabels}
            style={{ height: PREVIEW_CALENDAR_GRID_HEIGHT }}
          >
            {PREVIEW_CALENDAR_HOURS.map((hour) => (
              <div key={hour} className={styles.calendarHourLabel}>
                {formatPreviewHourLabel(hour)}
              </div>
            ))}
          </div>
          <div
            className={styles.calendarGrid}
            style={{ height: PREVIEW_CALENDAR_GRID_HEIGHT }}
          >
            {PREVIEW_CALENDAR_HOURS.map((hour) => (
              <div key={hour} className={styles.calendarHourRow} />
            ))}
            <div className={styles.calendarEventsLayer}>
              {layoutEvents.map((event) => (
                <div
                  key={event.id}
                  className={styles.calendarEventCard}
                  style={
                    {
                      top: `${event.top}px`,
                      height: `${event.height}px`,
                    } as React.CSSProperties
                  }
                >
                  <div className={styles.calendarEventHeader}>
                    <span className={styles.calendarEventTitle}>{event.title}</span>
                    <span className={styles.calendarEventTime}>
                      {event.timeLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.calendarNowLine} style={{ top: `${nowOffset}px` }}>
              <span className={styles.calendarNowDot} />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function OverviewContent({ dateKey, transition }: MainAppPreviewProps) {
  return (
    <motion.div className={styles.overviewLayout} transition={transition}>
      <PreviewCalendar dateKey={dateKey} transition={transition} />
      <motion.div className={styles.editorsStack} transition={transition}>
        <motion.section className={styles.editorSection} transition={transition}>
          <motion.div className={styles.editorTitle} transition={transition}>
            Tasks
          </motion.div>
          <motion.div className={styles.editorBody} transition={transition}>
            <ul className={styles.todoList}>
              {TODO_ITEMS.map((item) => (
                <li key={item.id} className={styles.todoItem}>
                  <span
                    className={[
                      styles.todoCheckbox,
                      item.checked ? styles.todoCheckboxChecked : "",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  <span
                    className={[
                      styles.todoText,
                      item.checked ? styles.todoTextDone : "",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.section>
        <motion.section className={styles.editorSection} transition={transition}>
          <motion.div className={styles.editorTitle} transition={transition}>
            Notes
          </motion.div>
          <motion.div className={styles.editorBody} transition={transition}>
            <ul className={styles.notesList}>
              {NOTE_ITEMS.slice(0, 2).map((item) => (
                <li key={item} className={styles.notesItem}>
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

export default function MainAppPreview({
  dateKey = "",
  transition,
  height,
}: MainAppPreviewProps) {
  const displayDate = React.useMemo(() => formatPreviewDate(dateKey), [dateKey]);

  return (
    <PreviewViewport height={height}>
      <PreviewSceneShell
        sceneKey="overview"
        heading={displayDate}
        transition={transition}
      >
        <OverviewContent dateKey={dateKey} transition={transition} />
      </PreviewSceneShell>
    </PreviewViewport>
  );
}
