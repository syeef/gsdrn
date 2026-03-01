import React from "react";
import { formatDateKey } from "~/utils/date";
import NavBar from "~/components/ui/NavBar/NavBar";
import Title from "~/components/ui/Title/Title";
import { FeaturedContentParallax } from "~/components/ui/FeaturedContentParallax/FeaturedContentParallax";

import styles from "../styles/index.module.css";
import MainAppPreview from "~/components/marketing/HeroPreview/MainAppPreview";
import PreviewNotes from "~/components/marketing/HeroPreview/PreviewNotes";
import PreviewTodo from "~/components/marketing/HeroPreview/PreviewTodo";
import Waveform from "~/components/marketing/Waveform/Waveform";
import {
  IconAiText,
  IconCalendarTimer,
  IconChevronRight,
  IconCursorList,
  IconEyeOff,
  IconHeadphones,
  IconMail,
  IconOrderedList,
  IconPlus,
  IconRotate,
  IconTag,
} from "~/components/ui/Icons/Icons";
import { getAuth } from "~/lib/auth.server";
import { redirect, type LoaderFunctionArgs } from "react-router";
import Badge from "~/components/ui/Badge/Badge";
import { Hr } from "~/components/ui/Hr/Hr";
import Footer from "~/components/ui/Footer/Footer";

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

type PricingPlan = {
  name: string;
  description: string;
  price: string;
  billingPeriod: string;
  features: string[];
};

const FEATURED: FeaturedItem[] = [
  {
    id: "todos",
    title: "Structure for your day",
    svgImage: <PreviewTodo transition={undefined} height={440} />,
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

    svgImage: <PreviewNotes transition={undefined} height={440} />,
    features: [
      {
        icon: <IconOrderedList />,
        heading: "Nest Notes",
        body: "Structured thinking",
      },
      {
        icon: <IconEyeOff />,
        heading: "Private",
        body: "Confidential by default",
      },
      {
        icon: <IconTag />,
        heading: "Labels",
        body: "Organised with intent",
      },
    ],
    headingColor: "gray",
  },
];

const FREE_PLAN: PricingPlan = {
  name: "Free",
  description: "Everything you need to organise your day.",
  price: "$0",
  billingPeriod: "/month",
  features: [
    "Automatic task rollover",
    "Nested tasks",
    "Nested notes",
    "Labelling",
  ],
};

const PLUS_PLAN: PricingPlan = {
  name: "Plus",
  description: "For deeper insight and intelligent automation.",
  price: "$5",
  billingPeriod: "/month",
  features: [
    "Everything in Free",
    "Daily audio brief",
    "Weekly summary email",
    "On-demand summaries",
    "Assisted scheduling",
  ],
};

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

export default function index() {
  const dateKey = React.useMemo(() => formatDateKey(new Date()), []);

  return (
    <>
      <div
        className={styles.pageContainer}
        style={{ position: "relative", backgroundColor: "var(--background)" }}
      >
        <NavBar />
        <main className={styles.page}>
          <div className={styles.hero}>
            <div>
              <Title variant="Hedvig" as="h1" headingColor="gray">
                Less chaos, more progress
              </Title>
              <p>An elegant view of your schedule, tasks, and notes.</p>
            </div>

            <div className={styles.illustration}>
              <MainAppPreview dateKey={dateKey} transition={undefined} />
            </div>
          </div>

          <FeaturedContentParallax items={FEATURED} stepHeight="20vh" />

          <section className={styles.featureCallout}>
            <div className={`${styles.col1row1} ${styles.centerFlow}`}>
              <Badge icon={<IconPlus width={8} height={8} />} label="Plus" />
              <div>
                <Title as="h1" headingColor="gray">
                  Your day, distilled
                </Title>
                <p>A spoken brief of what matters most.</p>
              </div>

              <div className={styles.featureBox}>
                <div className={styles.featureIcon}>
                  <IconHeadphones />
                </div>

                <div className={styles.featuredContent}>
                  <span className={styles.featureHeading}>Stay up to date</span>
                  <span className={styles.featureBody}>
                    Hear about your upcoming events and tasks, directly within
                    Tiketana or your favourite Podcast app.
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.col2row1}>
              <Waveform />
            </div>
            <div className={styles.col1row2}>Placeholder</div>
            <div className={`${styles.col2row2} ${styles.centerFlow}`}>
              <Badge icon={<IconPlus width={8} height={8} />} label="Plus" />
              <div>
                <Title as="h1" headingColor="gray">
                  A week, reflected
                </Title>
                <p>Insight into your progress, delivered.</p>
              </div>

              <div className={styles.featureBox}>
                <div className={styles.featureIcon}>
                  <IconMail />
                </div>

                <div className={styles.featuredContent}>
                  <span className={styles.featureHeading}>
                    A measured close
                  </span>
                  <span className={styles.featureBody}>
                    Every Friday, receive personalised insights about your tasks
                    and progress, straight to your inbox.
                  </span>
                </div>
              </div>
            </div>
            <div className={`${styles.col1row3} ${styles.centerFlow}`}>
              <Badge icon={<IconPlus width={8} height={8} />} label="Plus" />
              <div>
                <Title as="h1" headingColor="gray">
                  Summaries, summoned
                </Title>
                <p>Your work, synthesised into a clear, shareable overview.</p>
              </div>

              <div className={styles.featureBox}>
                <div className={styles.featureIcon}>
                  <IconAiText />
                </div>

                <div className={styles.featuredContent}>
                  <span className={styles.featureHeading}>Executive-ready</span>
                  <span className={styles.featureBody}>
                    Surface the impact behind your completed work.
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.col2row3}>Placeholder</div>
            <div className={styles.col1row4}>Placeholder</div>
            <div className={`${styles.col2row4} ${styles.centerFlow}`}>
              <Badge icon={<IconPlus width={8} height={8} />} label="Plus" />
              <div>
                <Title as="h1" headingColor="gray">
                  Prioritises, scheduled
                </Title>
                <p>Your tasks, intelligently placed into your day.</p>
              </div>

              <div className={styles.featureBox}>
                <div className={styles.featureIcon}>
                  <IconCalendarTimer />
                </div>

                <div className={styles.featuredContent}>
                  <span className={styles.featureHeading}>
                    Scheduled for you
                  </span>
                  <span className={styles.featureBody}>
                    Placed at the right time, automatically.
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.pricing}>
            <div className={styles.centerFlex}>
              <Title as="h1" headingColor="gray">
                Straightforward pricing
              </Title>
              <p>Experience the benefits of Plus for your first 60 days.</p>
            </div>
            <div className={styles.pricingCardContainer}>
              {/* Free */}
              <div className={styles.pricingCard}>
                <div className={styles.pricingDetails}>
                  <Title as="h3">{FREE_PLAN.name}</Title>
                  <p>{FREE_PLAN.description}</p>
                  <div className={styles.priceContainer}>
                    <span className={styles.price}>{FREE_PLAN.price}</span>
                    <span className={styles.billingPeriod}>
                      {FREE_PLAN.billingPeriod}
                    </span>
                  </div>
                  <Hr marginSize="small" />
                </div>
                <div className={styles.pricingFeatures}>
                  <ul>
                    {FREE_PLAN.features.map((feature) => (
                      <li className={styles.featureListItem} key={feature}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Plus */}
              <div className={`${styles.pricingCard} ${styles.pricingCardAlt}`}>
                <div className={styles.pricingDetails}>
                  <Title headingColor="orange" as="h3">
                    {PLUS_PLAN.name}
                  </Title>
                  <p>{PLUS_PLAN.description}</p>
                  <div className={styles.priceContainer}>
                    <span className={styles.price}>{PLUS_PLAN.price}</span>
                    <span className={styles.billingPeriod}>
                      {PLUS_PLAN.billingPeriod}
                    </span>
                  </div>
                  <Hr marginSize="small" />
                </div>
                <div className={styles.pricingFeatures}>
                  <ul>
                    {PLUS_PLAN.features.map((feature) => (
                      <li className={styles.featureListItem} key={feature}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <p className={styles.microCopy}>
              Prices shown in USD · Cancel anytime
            </p>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
