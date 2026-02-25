import * as React from "react";
import {
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "motion/react";
import styles from "../styles/indexV1.module.css";
import { getAuth } from "~/lib/auth.server";
import { formatDateKey } from "~/utils/date";
import HeroLaptop from "~/assets/images/background.jpg";
import NavBar from "~/components/ui/NavBar/NavBar";
import HeroPreview, {
  type HeroPreviewSceneState,
} from "~/components/marketing/HeroPreview/HeroPreview";

const HERO_SOURCE_WIDTH = 1536;
const HERO_SOURCE_HEIGHT = 1024;
const HERO_SCENE_HEIGHT_VH = 260;
const HERO_SCREEN_ROTATE_X_START_DEG = 8;
const HERO_INTRO_PHASE_END = 0.2;
const HERO_SCENE_TRANSITION = {
  duration: 0.62,
  ease: [0.22, 1, 0.36, 1] as const,
};
const HERO_LOAD_REVEAL_TRANSITION = {
  duration: 3.6,
  ease: [0.22, 1, 0.36, 1] as const,
};
// const HERO_TODO_SCENE_ENTER_THRESHOLD = 0.42;
const HERO_TODO_SCENE_ENTER_THRESHOLD = 0.2;
const HERO_TODO_SCENE_EXIT_THRESHOLD = 0.34;
// const HERO_NOTES_SCENE_ENTER_THRESHOLD = 0.72;
const HERO_NOTES_SCENE_ENTER_THRESHOLD = 0.54;
const HERO_NOTES_SCENE_EXIT_THRESHOLD = 0.68;
const SCREEN_RECT_CHANGE_THRESHOLD = 0.25;

const HERO_SCREEN_BOUNDS = {
  x: 348,
  y: 300,
  width: 831,
  height: 470,
} as const;
const HERO_SCREEN_FALLBACK = {
  left: "22.7%",
  top: "24%",
  width: "54.1%",
  previewHeight: "clamp(220px, 32vw, 470px)",
} as const;

const HERO_SCREEN_FIT_SCALE = 0.96;
type HeroHeaderTone = "orange" | "blue" | "white";
type ScreenRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type HeroHeaderSceneState = HeroPreviewSceneState;

const HERO_HEADER_SCENE_CONTENT: Record<
  HeroHeaderSceneState,
  {
    headline: string;
    tone: HeroHeaderTone;
    featureLabels: readonly [string, string, string];
  }
> = {
  overview: {
    headline: "Less chaos. More progress.",
    tone: "white",
    featureLabels: ["Calendar", "Tasks", "Notes"],
  },
  todos: {
    headline: "Your go to list.",
    tone: "orange",
    featureLabels: ["Nest Tasks", "Auto Rollover", "Reprioritise"],
  },
  notes: {
    headline: "Thoughts captured, instantly.",
    tone: "blue",
    featureLabels: ["Totally Private", " Nest Notes", "Feature Three"],
  },
};

const HERO_HEADER_TONE_CLASS: Record<HeroHeaderTone, string> = {
  orange: styles.heroShowcaseHeadlineOrange,
  blue: styles.heroShowcaseHeadlineBlue,
  white: styles.heroShowcaseHeadlineWhite,
};

export const meta: MetaFunction = () => [
  { title: "Tickatana" },
  { name: "description", content: "Where Tasks Get Done" },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname !== "/") return null;

  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (session) {
    throw redirect("/app");
  }

  return null;
}

export default function IndexPage() {
  const dateKey = React.useMemo(() => formatDateKey(new Date()), []);
  const shouldReduceMotion = useReducedMotion();
  const heroSceneRef = React.useRef<HTMLElement | null>(null);
  const heroFrameRef = React.useRef<HTMLDivElement | null>(null);
  const heroShowcaseRowRef = React.useRef<HTMLDivElement | null>(null);
  const [screenRect, setScreenRect] = React.useState<ScreenRect | null>(null);
  const [heroScene, setHeroScene] =
    React.useState<HeroHeaderSceneState>("overview");
  const [heroShowcaseRowOffsetTop, setHeroShowcaseRowOffsetTop] =
    React.useState(0);

  const { scrollYProgress } = useScroll({
    target: heroSceneRef,
    offset: ["start start", "end end"],
  });

  const introProgress = useTransform(
    scrollYProgress,
    [0, HERO_INTRO_PHASE_END],
    [0, 1],
  );
  const heroImageOpacity = useTransform(introProgress, [0, 1], [1, 0]);
  const heroScreenRotateX = useTransform(
    introProgress,
    [0, 1],
    [HERO_SCREEN_ROTATE_X_START_DEG, 0],
  );
  const heroScreenRotateXWithUnit = useMotionTemplate`${heroScreenRotateX}deg`;
  const heroShowcaseStyle = (
    screenRect
      ? {
          left: `${screenRect.left}px`,
          top: `${screenRect.top - heroShowcaseRowOffsetTop}px`,
          width: `${screenRect.width}px`,
          "--preview-height": `${screenRect.height}px`,
          "--screen-rotate-x": heroScreenRotateXWithUnit,
        }
      : {
          left: HERO_SCREEN_FALLBACK.left,
          top: `calc(${HERO_SCREEN_FALLBACK.top} - ${heroShowcaseRowOffsetTop}px)`,
          width: HERO_SCREEN_FALLBACK.width,
          "--preview-height": HERO_SCREEN_FALLBACK.previewHeight,
          "--screen-rotate-x": heroScreenRotateXWithUnit,
        }
  ) as React.CSSProperties;

  const updateHeroShowcaseMetrics = React.useCallback(() => {
    const frame = heroFrameRef.current;
    const showcaseRow = heroShowcaseRowRef.current;
    if (!frame || !showcaseRow) return;

    const frameRect = frame.getBoundingClientRect();
    const showcaseRowRect = showcaseRow.getBoundingClientRect();
    const frameWidth = frameRect.width;
    const frameHeight = frameRect.height;
    if (frameWidth <= 0 || frameHeight <= 0) return;

    const scale = Math.max(
      frameWidth / HERO_SOURCE_WIDTH,
      frameHeight / HERO_SOURCE_HEIGHT,
    );
    const renderedWidth = HERO_SOURCE_WIDTH * scale;
    const renderedHeight = HERO_SOURCE_HEIGHT * scale;
    const cropX = (frameWidth - renderedWidth) / 2;
    const cropY = (frameHeight - renderedHeight) / 2;

    const screenBounds = {
      left: cropX + HERO_SCREEN_BOUNDS.x * scale,
      top: cropY + HERO_SCREEN_BOUNDS.y * scale,
      width: HERO_SCREEN_BOUNDS.width * scale,
      height: HERO_SCREEN_BOUNDS.height * scale,
    };

    const fittedWidth = screenBounds.width * HERO_SCREEN_FIT_SCALE;
    const fittedHeight = screenBounds.height * HERO_SCREEN_FIT_SCALE;
    const fittedRect = {
      left: screenBounds.left + (screenBounds.width - fittedWidth) / 2,
      top: screenBounds.top + (screenBounds.height - fittedHeight) / 2,
      width: fittedWidth,
      height: fittedHeight,
    };

    setScreenRect((current) => {
      if (!current) return fittedRect;
      const changed =
        Math.abs(current.left - fittedRect.left) >
          SCREEN_RECT_CHANGE_THRESHOLD ||
        Math.abs(current.top - fittedRect.top) > SCREEN_RECT_CHANGE_THRESHOLD ||
        Math.abs(current.width - fittedRect.width) >
          SCREEN_RECT_CHANGE_THRESHOLD ||
        Math.abs(current.height - fittedRect.height) >
          SCREEN_RECT_CHANGE_THRESHOLD;
      return changed ? fittedRect : current;
    });

    const nextRowOffsetTop = showcaseRowRect.top - frameRect.top;
    setHeroShowcaseRowOffsetTop((current) =>
      Math.abs(current - nextRowOffsetTop) > SCREEN_RECT_CHANGE_THRESHOLD
        ? nextRowOffsetTop
        : current,
    );
  }, []);

  React.useEffect(() => {
    return scrollYProgress.on("change", (value) => {
      setHeroScene((current) => {
        if (current === "overview") {
          if (value >= HERO_NOTES_SCENE_ENTER_THRESHOLD) return "notes";
          if (value >= HERO_TODO_SCENE_ENTER_THRESHOLD) return "todos";
          return "overview";
        }

        if (current === "todos") {
          if (value >= HERO_NOTES_SCENE_ENTER_THRESHOLD) return "notes";
          if (value <= HERO_TODO_SCENE_EXIT_THRESHOLD) return "overview";
          return "todos";
        }

        if (value <= HERO_TODO_SCENE_EXIT_THRESHOLD) return "overview";
        if (value <= HERO_NOTES_SCENE_EXIT_THRESHOLD) return "todos";
        return "notes";
      });
    });
  }, [scrollYProgress]);

  React.useEffect(() => {
    const frame = heroFrameRef.current;
    const showcaseRow = heroShowcaseRowRef.current;
    if (!frame || !showcaseRow) return;

    updateHeroShowcaseMetrics();
    const observer = new ResizeObserver(updateHeroShowcaseMetrics);
    observer.observe(frame);
    observer.observe(showcaseRow);
    window.addEventListener("resize", updateHeroShowcaseMetrics);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeroShowcaseMetrics);
    };
  }, [updateHeroShowcaseMetrics]);

  React.useEffect(() => {
    updateHeroShowcaseMetrics();
  }, [heroScene, updateHeroShowcaseMetrics]);

  const heroHeaderContent = HERO_HEADER_SCENE_CONTENT[heroScene];
  const showHeroFeatureCards = heroScene !== "overview";
  const heroLoadBlurInitial = shouldReduceMotion
    ? false
    : { filter: "blur(14px)", opacity: 0.92 };
  const heroLoadBlurAnimate = shouldReduceMotion
    ? undefined
    : { filter: "blur(0px)", opacity: 1 };
  const heroScreenStyle =
    heroScene === "overview"
      ? undefined
      : ({ "--hero-screen-transform": "none" } as React.CSSProperties);

  return (
    <main className={styles.page}>
      <div className={styles.pageNav}>
        <NavBar />
      </div>
      <section
        className={styles.heroTrack}
        style={{ minHeight: `${HERO_SCENE_HEIGHT_VH}vh` }}
        ref={heroSceneRef}
      >
        <motion.div
          className={styles.heroSticky}
          initial={heroLoadBlurInitial}
          animate={heroLoadBlurAnimate}
          transition={HERO_LOAD_REVEAL_TRANSITION}
        >
          <motion.div className={styles.heroLaptop} ref={heroFrameRef}>
            <motion.img
              className={styles.heroLaptopImage}
              src={HeroLaptop}
              alt=""
              aria-hidden="true"
              style={{ opacity: heroImageOpacity }}
            />
          </motion.div>
          <motion.div
            className={styles.heroTopGradient}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={HERO_SCENE_TRANSITION}
          />
        </motion.div>
        <motion.div
          className={styles.heroShowcaseLayer}
          initial={heroLoadBlurInitial}
          animate={heroLoadBlurAnimate}
          transition={HERO_LOAD_REVEAL_TRANSITION}
        >
          <div className={styles.heroOverlayGrid}>
            <div className={styles.heroTitleRow}>
              <h1 className={styles.heroTitle}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`hero-title-${heroScene}`}
                    className={HERO_HEADER_TONE_CLASS[heroHeaderContent.tone]}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={HERO_SCENE_TRANSITION}
                    style={{ display: "inline-block" }}
                  >
                    {heroHeaderContent.headline}
                  </motion.span>
                </AnimatePresence>
              </h1>
            </div>
            <AnimatePresence initial={false}>
              {showHeroFeatureCards ? (
                <motion.div
                  key="hero-features-row"
                  className={styles.heroFeaturesRow}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={HERO_SCENE_TRANSITION}
                >
                  <section
                    className={`${styles.previewSectionFeatures} ${styles.heroTitleFeatures}`}
                  >
                    <div className={styles.heroTitleFeaturesGrid}>
                      {heroHeaderContent.featureLabels.map((label, index) => (
                        <article
                          key={`hero-feature-slot-${index}`}
                          className={styles.heroTitleFeatureCard}
                        >
                          <header className={styles.heroTitleFeatureLabel}>
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.span
                                key={`hero-feature-label-${index}-${heroScene}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={HERO_SCENE_TRANSITION}
                                style={{ display: "inline-block" }}
                              >
                                {label}
                              </motion.span>
                            </AnimatePresence>
                          </header>
                        </article>
                      ))}
                    </div>
                  </section>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <div className={styles.heroShowcaseRow} ref={heroShowcaseRowRef}>
              <motion.section
                className={styles.heroShowcase}
                style={heroShowcaseStyle}
              >
                <div className={styles.heroScreen} style={heroScreenStyle}>
                  <div className={styles.heroScreenInner}>
                    <HeroPreview
                      dateKey={dateKey}
                      scene={heroScene}
                      transition={HERO_SCENE_TRANSITION}
                    />
                  </div>
                </div>
              </motion.section>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
