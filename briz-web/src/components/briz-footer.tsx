"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { Asset } from "./catalog-cards";
import styles from "./briz-footer.module.css";

const categories = ["Education & Training", "Healthcare & Wellness", "Finance & Banking", "Retail & E-commerce", "Real Estate & Construction", "Technology & Innovation", "Entertainment & Media", "Travel & Tourism", "Sports & Recreation", "Food & Beverage", "Technology & Innovation", "Entertainment & Media", "Travel & Tourism", "Sports & Recreation", "Food & Beverage", "Technology & Innovation", "Entertainment & Media", "Travel & Tourism", "Sports & Recreation", "Food & Beverage", "Education & Training", "Healthcare & Wellness", "Finance & Banking", "Retail & E-commerce", "Retail & E-commerce"];
const categoryQueries: Record<string, string> = { "Retail & E-commerce": "Office Supplies", "Technology & Innovation": "Electronics", "Sports & Recreation": "Sports & Fitness", "Food & Beverage": "Groceries" };
const useful = ["About Briz", "Become a Seller", "FAQs", "Contact Support"];
const legal = ["Privacy Policy", "Terms of Use", "Return Policy"];
const description = "Find what you need from local sellers near you. Request products, compare offers, and chat directly with nearby stores.";

function FooterLinks({ items, onSelect }: { items: string[]; onSelect: (label: string) => void }) {
  return items.map(item => <button key={item} onClick={() => onSelect(item)}>{item}</button>);
}

export function BrizFooter() {
  const [information, setInformation] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  function show(label: string) { setInformation(label); dialog.current?.showModal(); }
  const company = <><p>Karobar Digital Pvt. Ltd.<br />Regd. No: 3023040<br />Department of Commerce, Supplies & Consumer Protection<br />Lalitpur, Bagmati, Nepal</p></>;
  const help = <><p>Our support team is here to help with your orders, requests, and account.</p><a href="tel:+9779812345678">+977 9812345678</a><a href="mailto:support@briz.com">support@briz.com</a><p>Sun-Fri, 10:00 AM -5:00 PM</p></>;
  const grievance = <><p>For complaints related to orders, sellers, payments, or returns:</p><a href="tel:+9779812345678">+977 9812345678</a><a href="mailto:grievance@briz.com">grievance@briz.com</a></>;
  const accordion: [string, ReactNode][] = [["Useful Links", <FooterLinks key="useful" items={useful} onSelect={show} />], ["Quick Links", <FooterLinks key="legal" items={legal} onSelect={show} />], ["Company Information", company], ["Grievance Redressal", grievance], ["Need Help?", help]];
  return <footer className={styles.footer}>
    <div className={styles.inner}>
      <section className={styles.categories}><h2>Categories</h2><div>{categories.map((label, index) => <Link key={`${label}-${index}`} href={`/search?${new URLSearchParams({ q: categoryQueries[label] || label })}`}>{label}</Link>)}</div></section>
      <div className={styles.middle}>
        <div className={styles.brand}><Link href="/" aria-label="Briz home"><Image src="/figma/results/footer-imgLogo.svg" width={56} height={26} alt="Briz" unoptimized /></Link><p>{description}</p><div className={styles.socials}><span>FOLLOW US ON</span><div>{["Facebook", "Instagram", "Twitter", "Linkedin"].map(name => <button key={name} aria-label={`Briz on ${name}`} onClick={() => show(`${name} community`)}><Asset name={`footer-imgSocialsIconDarkDefault${name}`} size={24} /></button>)}</div></div></div>
        <section className={styles.desktop}><h2>Useful Links</h2>{<FooterLinks key="useful" items={useful} onSelect={show} />}</section>
        <section className={styles.desktop}><h2>Legal</h2>{<FooterLinks key="legal" items={legal} onSelect={show} />}</section>
        <section className={`${styles.download} ${styles.desktop}`}><h2>Download App</h2><button onClick={() => show("Download the Briz app")} aria-label="Download the Briz app"><Image src="/figma/results/footer-imgVector1.png" width={60} height={60} alt="Briz app QR code" /><span><Image src="/figma/results/footer-imgImage9.png" width={104} height={32} alt="Download on the App Store" /><Image src="/figma/results/footer-imgImage10.png" width={104} height={32} alt="Get it on Google Play" /></span></button></section>
      </div>
      <div className={styles.contact}><section><h2>Company Information</h2>{company}</section><section><h2>Need Help?</h2>{help}</section><section><h2>Grievance Redressal</h2>{grievance}</section></div>
      <div className={styles.accordions}>{accordion.map(([title, content]) => <details key={title}><summary>{title}<Asset name="footer-imgChevron" /></summary><div>{content}</div></details>)}</div>
      <div className={styles.bottom}><span>© 2026 <strong>Briz.</strong> All rights reserved.</span><span>From the makers of <Image src="/figma/results/footer-imgLayer1.svg" width={105} height={25} alt="Karobar" unoptimized /></span></div>
    </div>
    <dialog ref={dialog} className={styles.infoDialog} aria-labelledby="footer-information"><div><h2 id="footer-information">{information}</h2><button aria-label="Close information" onClick={() => dialog.current?.close()}>×</button></div><p>{information === "About Briz" ? description : "This destination isn’t connected in the local preview yet."}</p><button onClick={() => dialog.current?.close()}>Got it</button></dialog>
  </footer>;
}
