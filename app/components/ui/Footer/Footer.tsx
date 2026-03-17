import styles from "./Footer.module.css";
import Title from "../Title/Title";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Title as="h1" className={styles.footerTitle}>
        Tiketana
      </Title>
      {/* <div className={styles.footerLinks}>
        <span>
          Made by{" "}
          <a className={styles.footerLink} href="https://greeblelabs.io/">
            Greeble Labs
          </a>
          .
        </span>
      </div> */}
    </footer>
  );
}
