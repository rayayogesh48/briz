"use client";

import Image from "next/image";
import { BadgeCheck, Clock, FileCheck2, MapPin, Phone, Star, Store, Truck } from "lucide-react";
import { useState } from "react";
import { PHOTOS, TRUST_POINTS, type TrustKey } from "./about-data";
import { Reveal, RevealHeading } from "./motion";
import styles from "./about.module.css";

function StoreProfile({ active }: { active: TrustKey }) {
  const part = (key: TrustKey) => ({ "data-part": key, "data-active": active === key });
  return (
    <div className={styles.profile} role="img" aria-label="Example Briz store profile for a verified store">
      <div className={styles.profileInner} aria-hidden="true">
        <div className={styles.profileCover}>
          <Image src={PHOTOS.storefront.src} alt="" fill sizes="(max-width: 900px) 100vw, 640px" unoptimized />
          <span className={styles.profileDistance}>
            <MapPin size={13} /> 350 m away
          </span>
        </div>

        <div className={styles.profileBody}>
          <div className={styles.profileTop}>
            <span className={`${styles.storeAvatar} ${styles.profileAvatar}`}>HB</span>
            <div className={styles.profileName}>
              <strong>Himalayan Bazzar</strong>
              <span>Stationery &amp; office supplies · New Baneshwor</span>
            </div>
            <span className={styles.profileBadge} {...part("verified")}>
              <BadgeCheck size={16} /> Verified store
            </span>
          </div>

          <div className={styles.profileStats}>
            <div className={styles.profileStat} {...part("reviews")}>
              <span className={styles.profileRating}>
                <Star size={16} fill="currentColor" /> 4.8
              </span>
              <span>126 reviews</span>
              <q>Had exactly what I needed, ready when I arrived.</q>
            </div>
            <div className={styles.profileStat} {...part("fulfilment")}>
              <span className={styles.profileChips}>
                <span>
                  <Store size={14} /> Pickup today
                </span>
                <span>
                  <Truck size={14} /> Delivery in Kathmandu
                </span>
              </span>
              <span>Options shown before you order</span>
            </div>
          </div>

          <ul className={styles.profileInfo} {...part("info")}>
            <li>
              <MapPin size={15} /> Mid Baneshwor, Kathmandu
            </li>
            <li>
              <Clock size={15} /> <span className={styles.open}>Open now</span> · closes 8:00 PM
            </li>
            <li>
              <Phone size={15} /> Call or chat with the store
            </li>
          </ul>

          <div className={styles.profileBusiness} {...part("business")}>
            <FileCheck2 size={16} />
            <span>
              <strong>Business verified</strong>
              Registration documents reviewed by Briz
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Trust() {
  const [active, setActive] = useState<TrustKey>("verified");
  return (
    <section className={styles.section} aria-labelledby="about-trust">
      <div className={`${styles.container} ${styles.trustGrid}`}>
        <div className={styles.trustCopy}>
          <Reveal>
            <p className={styles.eyebrow}>Trust</p>
          </Reveal>
          <RevealHeading id="about-trust" className={styles.title} text="Know who you’re buying from." />
          <ol className={styles.trustList}>
            {TRUST_POINTS.map((point, index) => (
              <li key={point.key}>
                <button
                  type="button"
                  aria-pressed={active === point.key}
                  onMouseEnter={() => setActive(point.key)}
                  onFocus={() => setActive(point.key)}
                  onClick={() => setActive(point.key)}
                >
                  <span className={styles.trustIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.trustText}>
                    <strong>{point.title}</strong>
                    <span>{point.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className={styles.trustVisual}>
          <StoreProfile active={active} />
        </Reveal>
      </div>
    </section>
  );
}
