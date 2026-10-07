import { BrizFooter } from "@/components/briz-footer";
import { BrizHeader } from "@/components/briz-header";
import { BuiltForNepal } from "./built-for-nepal";
import { Closing } from "./closing";
import { Difference } from "./difference";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { LocalCommerce } from "./local-commerce";
import { Trust } from "./trust";
import { TwoSides } from "./two-sides";
import { WhyBriz } from "./why-briz";
import styles from "./about.module.css";

export function AboutPage() {
  return (
    <div className={styles.shell}>
      <BrizHeader variant="download" />
      <main className={styles.page}>
        <Hero />
        <WhyBriz />
        <HowItWorks />
        <Difference />
        <TwoSides />
        <LocalCommerce />
        <BuiltForNepal />
        <Trust />
        <Closing />
      </main>
      <BrizFooter />
    </div>
  );
}
