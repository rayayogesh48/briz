"use client";

import Image from "next/image";
import styles from "./home-components.module.css";

export function AppDownloadBanner() {
  return (
    <section className={styles.appDownloadSection} aria-label="Briz Mobile App Download">
      <div className={styles.appDownloadCard}>
        <div className={styles.appDownloadContent}>
          <h2>Built for how local shopping should work</h2>
          <p>
            Find what you need, connect with real shops near you, and stop wasting time going from store to store.
          </p>

          <div className={styles.qrContainer}>
            <div className={styles.qrCode} title="Scan QR Code to download Briz App">
              <Image
                src="/figma/home/app-qr-code.png"
                alt="Briz app QR code"
                width={100}
                height={100}
              />
            </div>

            <div className={styles.storeBadges}>
              <a
                href="#"
                className={styles.badgeLink}
                aria-label="Download Briz on the App Store"
                onClick={(e) => e.preventDefault()}
              >
                <Image
                  src="/figma/results/footer-imgImage9.png"
                  alt="Download on the App Store"
                  width={140}
                  height={42}
                />
              </a>
              <a
                href="#"
                className={styles.badgeLink}
                aria-label="Get Briz on Google Play"
                onClick={(e) => e.preventDefault()}
              >
                <Image
                  src="/figma/results/footer-imgImage10.png"
                  alt="Get it on Google Play"
                  width={140}
                  height={42}
                />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.appPhonesGraphic}>
          <Image
            src="/figma/home/app-download-phones.png"
            alt="Briz mobile app experience preview"
            fill
            sizes="(max-width: 640px) 100vw, 500px"
          />
        </div>
      </div>
    </section>
  );
}

