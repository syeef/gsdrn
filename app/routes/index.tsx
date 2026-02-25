import React from "react";
import { formatDateKey } from "~/utils/date";
import NavBar from "~/components/ui/NavBar/NavBar";
import Title from "~/components/ui/Title/Title";
import { FeaturedContentParallax } from "~/components/ui/FeaturedContentParallax/FeaturedContentParallax";

import styles from "../styles/index.module.css";
import HeroPreview from "~/components/marketing/HeroPreview/HeroPreview";
import {
  IconChevronRight,
  IconCursorList,
  IconEyeOff,
  IconOrderedList,
  IconRotate,
} from "~/components/ui/Icons/Icons";

type HeadingColor = "default" | "orange" | "blue" | "purple" | "green" | "gray";

type FeaturedFeature = {
  id?: string;
  icon?: React.ReactNode;
  heading: React.ReactNode;
  body: React.ReactNode;
};

type FeaturedItem = {
  id: string;

  title: string;
  description?: string;
  features?: FeaturedFeature[];
  svgImage?: React.ReactElement;
  headingColor?: HeadingColor;
};

const FEATURED: FeaturedItem[] = [
  {
    id: "todos",
    title: "Structure for your day",
    svgImage: (
      <HeroPreview scene={"todos"} transition={undefined} height={440} />
    ),
    features: [
      {
        icon: <IconOrderedList />,
        heading: "Nest Tasks",
        body: "Composed, not cluttered",
      },
      {
        icon: <IconRotate />,
        heading: "Automatic Rollover",
        body: "Continuity built in",
      },
      {
        icon: <IconCursorList />,
        heading: "Reprioritise",
        body: "Effortlessly refocus",
      },
    ],
    headingColor: "gray",
  },
  {
    id: "notes",
    title: "Thoughts captured, instantly",

    svgImage: (
      <HeroPreview scene={"notes"} transition={undefined} height={440} />
    ),
    features: [
      {
        icon: <IconEyeOff />,
        heading: "Private",
        body: "Confidential by default",
      },
      {
        icon: <IconOrderedList />,
        heading: "Nest Notes",
        body: "Structured thinking",
      },
    ],
    headingColor: "gray",
  },
];

export default function index() {
  const dateKey = React.useMemo(() => formatDateKey(new Date()), []);

  return (
    <>
      <NavBar />
      <main className={styles.page}>
        <div className={styles.hero}>
          <div>
            <Title variant="Hedvig" as="h1" headingColor="gray">
              Less chaos. More progress.
            </Title>
            <p>An elegant view of your schedule, tasks, and notes.</p>
          </div>

          <div className={styles.illustration}>
            <HeroPreview
              dateKey={dateKey}
              scene={"overview"}
              transition={undefined}
            />
          </div>
        </div>

        <FeaturedContentParallax items={FEATURED} stepHeight="30vh" />
      </main>
    </>
  );
}
