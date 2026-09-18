import Link from "next/link";
import { BrizHeader } from "@/components/briz-header";
import styles from "./home.module.css";

export default function Home() {
  return <><BrizHeader /><main className={styles.home} aria-label="Storefront"><section className={styles.category}><p>Shop by category</p><h1>Explore products &amp; stores</h1><Link href="/search">View category</Link></section></main></>;
}
