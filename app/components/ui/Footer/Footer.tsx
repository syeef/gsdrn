import { NavLink } from "react-router";

import styles from "./Footer.module.css";
import Title from "../Title/Title";

const sections = [
  {
    title: "Syeef Karim",
    links: [
      { text: "About", to: "/about", isInternal: true },
      {
        text: "Curriculum vitae",
        to: "/documents/Syeef-Karim-CV-2026.pdf",
        isInternal: false,
      },
    ],
  },
  {
    title: "Work",
    links: [
      { text: "Featured Work", to: "/featured-work", isInternal: true },
      // { text: "Design Process", to: "/process", isInternal: true },
      // { text: "Sketches", to: "/sketches", isInternal: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { text: "Notes", to: "/notes", isInternal: true },
      // { text: "Maps", to: "/maps", isInternal: true },
      // { text: "Bookmarks", to: "/bookmarks", isInternal: true },
      // { text: "Taps", to: "/taps", isInternal: true },
      { text: "Listening", to: "/listening", isInternal: true },
    ],
  },
  {
    title: "Contact",
    links: [
      { text: "X", to: "https://x.com/syeefk", isInternal: false },
      // { text: "Figma", to: "https://figma.com/@syeef", isInternal: false },
      // {
      //   text: "Dribbble",
      //   to: "https://dribbble.com/syeef",
      //   isInternal: false,
      // },
      // { text: "GitHub", to: "https://github.com/syeef", isInternal: false },
      {
        text: "LinkedIn",
        to: "https://uk.linkedin.com/in/syeefkarim/",
        isInternal: false,
      },
    ],
  },
];

const renderLink = (link) => {
  if (link.isInternal) {
    return (
      <NavLink to={link.to} className={styles.footerLink} prefetch="intent">
        {/* <span className={styles.link}>{link.text}</span> */}
        <span>{link.text}</span>
      </NavLink>
    );
  }

  return (
    <a
      href={link.to}
      className={styles.footerLink}
      target="_blank"
      rel="noreferrer"
    >
      {/* <span className={styles.link}>{link.text}</span> */}
      <span>{link.text}</span>
    </a>
  );
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Title as="h1" className={styles.footerTitle}>
        Tiketana
      </Title>
      <div className={styles.footerLinks}>
        <span>
          Made by{" "}
          <a className={styles.footerLink} href="https://greeblelabs.io/">
            Greeble Labs
          </a>
          .
        </span>
      </div>
    </footer>
  );
}
