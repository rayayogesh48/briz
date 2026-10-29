import { BrizHeader } from "@/components/briz-header";
import styles from "./preview.module.css";
export default function Preview() {
 return <main className={styles.canvas} aria-label="Figma navigation variants">
  <section className={styles.desktop} aria-label="Desktop"><BrizHeader /></section>
  <section className={styles.tablet} aria-label="Tablet"><BrizHeader /></section>
  <section className={styles.phone} aria-label="Phone"><BrizHeader /></section>
 </main>;
}
