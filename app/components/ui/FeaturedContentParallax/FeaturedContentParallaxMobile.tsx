import * as React from "react";
import { NavLink } from "react-router";

import Title from "~/components/ui/Title/Title";
import { IconChevronRight } from "~/components/ui/Icons/Icons";
import type { FeaturedItem } from "./FeaturedContentParallax";

import styles from "./FeaturedContentParallaxMobile.module.css";

type Props = {
  items: FeaturedItem[];
};

export function FeaturedContentParallaxMobile({ items }: Props) {
  return (
    <section className={styles.root}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <NavLink
              to={item.to}
              className={styles.learnMore}
              viewTransition
              prefetch="intent"
            >
              Learn more <IconChevronRight width={18} height={18} />
            </NavLink>

            <Title
              variant="GoogleSans"
              className={styles.title}
              headingColor={item.headingColor}
            >
              {item.title}
            </Title>

            <p className={styles.description}>{item.description}</p>

            <div className={styles.media} aria-hidden="true">
              {item.svgImage}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
