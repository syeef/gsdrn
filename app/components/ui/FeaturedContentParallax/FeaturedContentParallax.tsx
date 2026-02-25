import * as React from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import Title from "~/components/ui/Title/Title";
import { IconChevronRight } from "~/components/ui/Icons/Icons";

import styles from "./FeaturedContentParallax.module.css";

type HeadingColor = "default" | "orange" | "blue" | "purple" | "green" | "gray";

export type FeaturedFeature = {
  id?: string;
  icon?: React.ReactNode;
  heading: React.ReactNode;
  body: React.ReactNode;
};

export type FeaturedItem = {
  id: string;
  to?: string;
  title: string;
  description?: string;
  features?: FeaturedFeature[];
  svgImage?: React.ReactElement;
  headingColor?: HeadingColor;
};

type Props = {
  items: FeaturedItem[];
  stepHeight?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function FeaturedContentParallax({ items, stepHeight = "70vh" }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const textTransition = React.useMemo(
    () =>
      prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.32, ease: "easeOut" as const },
    [prefersReducedMotion],
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const steps = Math.max(1, items.length);
  const maxIndex = steps - 1;
  // Add extra scroll room for the last item to complete its slide-in animation
  const transitions = Math.max(1, steps - 1 + 0.5);

  // Map scroll progress to a continuous index (0 to transitions)
  const continuousIndex = useTransform(scrollYProgress, (p) => {
    if (steps === 1) return 0;
    return clamp(p, 0, 1) * transitions;
  });

  // Current discrete index for text/UI
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    return continuousIndex.on("change", (v) => {
      setActiveIndex(clamp(Math.floor(v), 0, maxIndex));
    });
  }, [continuousIndex, maxIndex]);

  const current = items[activeIndex];

  // Calculate opacity and position for each item based on continuous scroll
  function getItemTransforms(itemIndex: number) {
    // Special case for first item - it starts visible at the top
    if (itemIndex === 0) {
      const disappearStart = 0.4;
      const disappearEnd = 0.75;

      const opacity = useTransform(continuousIndex, (v) => {
        // Fully visible at start
        if (v < disappearStart) return 1;

        // Fade out
        if (v < disappearEnd) {
          const progress =
            (v - disappearStart) / (disappearEnd - disappearStart);
          return 1 - progress * 0.8; // Fade to 20% opacity
        }

        return 0;
      });

      const y = useTransform(continuousIndex, (v) => {
        // Stay at center initially
        if (v < disappearStart) return 0;

        // Drift up slightly
        if (v < disappearEnd) {
          const progress =
            (v - disappearStart) / (disappearEnd - disappearStart);
          return -32 * progress;
        }

        return -32;
      });

      return { opacity, y };
    }

    // For all other items: slide in from below
    const appearStart = itemIndex - 0.5;
    const appearEnd = itemIndex + 0.1;

    const isLast = itemIndex === maxIndex;

    const opacity = useTransform(continuousIndex, (v) => {
      // Before entering: hidden
      if (v < appearStart) return 0;

      // Fade/slide in
      if (v < appearEnd) {
        const progress = (v - appearStart) / (appearEnd - appearStart);
        return progress;
      }

      // If last item: stop here, never fade out
      if (isLast) return 1;

      // Otherwise: normal disappear behaviour
      const disappearStart = itemIndex + 0.4;
      const disappearEnd = Math.min(transitions, itemIndex + 0.75);

      if (v < disappearStart) return 1;

      if (v < disappearEnd) {
        const progress = (v - disappearStart) / (disappearEnd - disappearStart);
        return 1 - progress * 0.8; // Fade to 20% opacity
      }

      return 0;
    });

    const y = useTransform(continuousIndex, (v) => {
      // Before entering: start below
      if (v < appearStart) return 160;

      // Slide up to center
      if (v < appearEnd) {
        const progress = (v - appearStart) / (appearEnd - appearStart);
        return 160 * (1 - progress);
      }

      // If last item: stop here, stay centered forever
      if (isLast) return 0;

      // Otherwise: normal drift behaviour
      const disappearStart = itemIndex + 0.4;
      const disappearEnd = Math.min(transitions, itemIndex + 0.75);

      if (v < disappearStart) return 0;

      if (v < disappearEnd) {
        const progress = (v - disappearStart) / (disappearEnd - disappearStart);
        return -32 * progress;
      }

      return -32;
    });

    return { opacity, y };
  }

  return (
    <section
      ref={sectionRef}
      className={styles.root}
      style={
        {
          ["--featured-steps" as any]: steps,
          ["--featured-step" as any]: stepHeight,
        } as React.CSSProperties
      }
    >
      <div className={styles.sticky}>
        <div className={styles.titleSwap}>
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={`featured-title-${current.id}`}
              className={styles.swapLayer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={textTransition}
            >
              <Title
                variant="Hedvig"
                as="h1"
                className={styles.title}
                headingColor={current.headingColor}
              >
                {current.title}
              </Title>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.contentSwap}>
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={`featured-copy-${current.id}`}
              className={styles.swapLayer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={textTransition}
            >
              {current.features && current.features.length > 0 ? (
                <div className={styles.features} role="list">
                  {current.features.map((feature, index) => (
                    <div
                      key={feature.id ?? `${current.id}-feature-${index}`}
                      className={styles.featureBox}
                      role="listitem"
                    >
                      {feature.icon ? (
                        <div className={styles.featureIcon}>{feature.icon}</div>
                      ) : null}
                      <div className={styles.featuredContent}>
                        <span className={styles.featureHeading}>
                          {feature.heading}
                        </span>
                        <span className={styles.featureBody}>
                          {feature.body}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : current.description ? (
                <p className={styles.description}>{current.description}</p>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Media stage */}
        <div className={styles.mediaStage} aria-hidden="true">
          {items.map((item, index) => {
            const { opacity, y } = getItemTransforms(index);

            return (
              <motion.div
                key={item.id}
                className={styles.mediaLayer}
                style={
                  prefersReducedMotion
                    ? {
                        opacity: index === activeIndex ? 1 : 0,
                      }
                    : {
                        opacity,
                        y,
                      }
                }
              >
                {item.svgImage ? (
                  <div className={styles.mediaStack}>
                    <div className={styles.mediaInner}>{item.svgImage}</div>
                    <div className={styles.reflection} aria-hidden="true">
                      <div className={styles.mediaInner}>{item.svgImage}</div>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* The runway controls scroll distance */}
      <div className={styles.runway} aria-hidden="true" />
    </section>
  );
}
