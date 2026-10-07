"use client";

import Image from "next/image";
import { BadgeCheck, MapPin, Search } from "lucide-react";
import type { ReactNode } from "react";
import { OFFERS, PRODUCT_IMAGES, REQUEST } from "./about-data";
import { Reveal, RevealHeading } from "./motion";
import styles from "./about.module.css";

const CUSTOMER_BENEFITS = [
  "Find nearby products",
  "Discover local stores",
  "Check availability",
  "Request missing products",
  "Compare seller offers",
  "Chat directly with stores",
];

const STORE_BENEFITS = [
  "Build a digital storefront",
  "List products",
  "Reach nearby customers",
  "Receive customer requests",
  "Send offers",
  "Talk directly with buyers",
];

function Phone({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className={styles.phone} role="img" aria-label={label}>
      <div className={styles.phoneScreen} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

function CustomerPhone() {
  return (
    <Phone label="Briz customer app showing a product request with seller offers and a chat">
      <div className={styles.phoneSearch}>
        <Search size={14} /> Search nearby
        <span>
          <MapPin size={11} /> {REQUEST.area}
        </span>
      </div>
      <p className={styles.phoneLabel}>Your request</p>
      <div className={styles.phoneCard}>
        <strong>{REQUEST.title}</strong>
        <span>3 offers · updated just now</span>
      </div>
      {OFFERS.slice(0, 2).map((offer) => (
        <div key={offer.store} className={styles.phoneRow}>
          <span className={styles.phoneRowText}>
            <strong>{offer.store}</strong>
            <span>{offer.distance} away</span>
          </span>
          <strong>{offer.price}</strong>
        </div>
      ))}
      <p className={styles.phoneLabel}>Chat · Paper &amp; Print Nepal</p>
      <span className={`${styles.bubble} ${styles.bubbleOut}`}>Is it the sealed original set?</span>
      <span className={styles.bubble}>Yes. Come by any time before 8.</span>
    </Phone>
  );
}

function SellerPhone() {
  return (
    <Phone label="Briz seller app showing a new nearby request, an offer form and product listings">
      <div className={styles.phoneStore}>
        <span className={styles.storeAvatar}>PP</span>
        <span className={styles.phoneRowText}>
          <strong>
            Paper &amp; Print Nepal <BadgeCheck size={13} className={styles.verifiedIcon} />
          </strong>
          <span className={styles.open}>Open · Putalisadak</span>
        </span>
      </div>
      <p className={styles.phoneLabel}>New request · 1.2 km away</p>
      <div className={`${styles.phoneCard} ${styles.phoneCardAccent}`}>
        <strong>{REQUEST.title}</strong>
        <span>{REQUEST.note}</span>
        <span className={styles.phoneOffer}>
          <span>Your price</span>
          <strong>Rs. 1,980</strong>
        </span>
        <span className={styles.phoneButton}>Send offer</span>
      </div>
      <p className={styles.phoneLabel}>Your listings</p>
      <div className={styles.phoneListings}>
        {[PRODUCT_IMAGES.paper, PRODUCT_IMAGES.bottle, PRODUCT_IMAGES.craft].map((src) => (
          <span key={src} className={styles.phoneListing}>
            <Image src={src} alt="" fill sizes="72px" />
          </span>
        ))}
      </div>
    </Phone>
  );
}

function Benefits({ items }: { items: string[] }) {
  return (
    <ul className={styles.benefits}>
      {items.map((item, index) => (
        <li key={item}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function TwoSides() {
  return (
    <section className={styles.sides} aria-labelledby="about-sides">
      <div className={styles.container}>
        <RevealHeading
          id="about-sides"
          className={styles.sidesHead}
          text={"Two sides.\nOne local marketplace."}
        />

        <div className={styles.sidesGrid}>
          <div className={styles.sideCopy}>
            <p className={styles.sideLabel}>For customers</p>
            <RevealHeading as="h3" className={styles.sideTitle} text="Spend less time searching." />
            <Reveal delay={0.15}>
              <Benefits items={CUSTOMER_BENEFITS} />
            </Reveal>
          </div>

          <Reveal className={styles.sidePhoneLeft}>
            <CustomerPhone />
          </Reveal>

          <div className={styles.bridge} aria-hidden="true">
            <span className={styles.bridgeLine}>
              <i />
              <i />
            </span>
            <span className={styles.bridgeBadge}>briz</span>
            <span className={styles.bridgeLabels}>
              <span>Requests →</span>
              <span>← Offers</span>
            </span>
          </div>

          <div className={`${styles.sideCopy} ${styles.sideCopyStore}`}>
            <p className={styles.sideLabel}>For local stores</p>
            <RevealHeading as="h3" className={styles.sideTitle} text="Get discovered by people already looking." />
            <Reveal delay={0.15}>
              <Benefits items={STORE_BENEFITS} />
            </Reveal>
          </div>

          <Reveal className={styles.sidePhoneRight} delay={0.12}>
            <SellerPhone />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
