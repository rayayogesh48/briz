import { BrizHeader } from "@/components/briz-header";
import styles from "./preview.module.css";
export default function Preview() {
 return <main className={styles.canvas} aria-label="Figma navigation variants">
  <section className={styles.desktop} aria-label="Signed-in desktop"><BrizHeader /></section>
  <section className={styles.desktop} aria-label="Download app desktop"><BrizHeader variant="download" /></section>
  <section className={styles.tablet} aria-label="Tablet"><BrizHeader variant="download" /></section>
  <section className={styles.phone} aria-label="Phone"><BrizHeader variant="download" /></section>
 </main>;
}
