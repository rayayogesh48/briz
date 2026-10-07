"use client";

import Image from "next/image";
import { ArrowRight, BadgeCheck, Check, MapPin, MessageCircle, RotateCcw, Search } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { CHOSEN_OFFER, OFFERS, REQUEST, SEARCH_RESULTS } from "./about-data";
import { EASE, Reveal, RevealHeading } from "./motion";
import styles from "./about.module.css";

function Flow({ steps, active }: { steps: string[]; active?: number }) {
  return (
    <ol className={styles.flow}>
      {steps.map((step, index) => (
        <Fragment key={step}>
          {index > 0 && (
            <li className={styles.flowArrow} aria-hidden="true">
              <ArrowRight size={14} />
            </li>
          )}
          <li className={styles.flowStep} data-active={active === undefined || index <= active}>
            {step}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}

function DiscoverMock() {
  return (
    <div className={styles.searchMock} aria-hidden="true">
      <div className={styles.searchField}>
        <Search size={18} />
        <span className={styles.searchQuery}>thermal paper</span>
        <span className={styles.searchPlace}>
          <MapPin size={13} /> New Baneshwor
        </span>
      </div>
      <p className={styles.mockLabel}>Products near you</p>
      {SEARCH_RESULTS.map((result, index) => (
        <Reveal key={result.name} delay={0.15 + index * 0.1} y={14}>
          <div className={styles.resultRow}>
            <span className={styles.thumb}>
              <Image src={result.image} alt="" fill sizes="56px" />
            </span>
            <span className={styles.resultText}>
              <span className={styles.resultName}>{result.name}</span>
              <span className={styles.resultMeta}>
                {result.store} · {result.distance}
              </span>
            </span>
            <span className={styles.resultSide}>
              <strong>{result.price}</strong>
              <span className={styles.open}>In stock</span>
            </span>
          </div>
        </Reveal>
      ))}
      <p className={styles.mockLabel}>Stores near you</p>
      <Reveal delay={0.4} y={14}>
        <div className={styles.resultRow}>
          <span className={styles.storeAvatar}>HB</span>
          <span className={styles.resultText}>
            <span className={styles.resultName}>
              Himalayan Bazzar <BadgeCheck size={15} className={styles.verifiedIcon} />
            </span>
            <span className={styles.resultMeta}>Stationery &amp; office supplies · 350 m</span>
          </span>
          <span className={styles.resultSide}>
            <span className={styles.open}>Open now</span>
          </span>
        </div>
      </Reveal>
    </div>
  );
}

const REQUEST_STEPS = ["Request", "Offers", "Compare", "Choose"];
const STEP_DELAYS = [1000, 2900, 4600];

function RequestFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [progress, setProgress] = useState(0);
  const step = reduce ? 3 : progress;

  useEffect(() => {
    if (!inView || reduce) return;
    const timers = STEP_DELAYS.map((ms, index) => setTimeout(() => setProgress(index + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce, run]);

  function replay() {
    setProgress(0);
    setRun((count) => count + 1);
  }

  return (
    <div className={styles.requestStage} ref={ref}>
      <div className={styles.requestStageTop}>
        <Flow steps={REQUEST_STEPS} active={step} />
        {!reduce && (
          <button type="button" className={styles.replay} onClick={replay}>
            <RotateCcw size={14} aria-hidden="true" /> Replay
          </button>
        )}
      </div>

      <div className={styles.requestCard} aria-hidden="true">
        <span className={styles.requestCardLabel}>Your request · {REQUEST.area}</span>
        <span className={styles.requestCardTitle}>{REQUEST.title}</span>
        <span className={styles.requestCardNote}>{REQUEST.note}</span>
        <span className={styles.requestCardStatus} data-live={step >= 1}>
          <span className={styles.pulse} />
          {step >= 1 ? "3 nearby sellers replied" : "Sending to nearby sellers…"}
        </span>
      </div>

      <div className={styles.offerRail} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <ul className={styles.offers} aria-label="Seller offers for the request">
        {OFFERS.map((offer, index) => {
          const chosen = step >= 3 && index === CHOSEN_OFFER;
          return (
            <motion.li
              key={offer.store}
              className={styles.offer}
              data-chosen={chosen}
              initial={false}
              animate={step >= 1 ? { opacity: step >= 3 && !chosen ? 0.5 : 1, y: 0 } : { opacity: 0, y: 28 }}
              transition={{ duration: 0.6, delay: step === 1 ? index * 0.22 : 0, ease: EASE }}
            >
              <span className={styles.offerHead}>
                <span className={styles.offerStore}>{offer.store}</span>
                <span className={styles.offerPlace}>
                  {offer.area} · {offer.distance}
                </span>
              </span>
              <span className={styles.offerPrice}>{offer.price}</span>
              <span className={styles.offerNote}>{offer.note}</span>
              <span className={styles.offerFoot}>
                <span className={styles.offerTag} data-visible={step >= 2}>
                  {offer.tag}
                </span>
                {chosen ? (
                  <span className={styles.offerChosen}>
                    <Check size={14} aria-hidden="true" /> Chosen
                  </span>
                ) : (
                  <span className={styles.offerChat}>
                    <MessageCircle size={14} aria-hidden="true" /> Chat
                  </span>
                )}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="about-how">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <Reveal>
            <p className={styles.eyebrow}>How Briz works</p>
          </Reveal>
          <RevealHeading
            id="about-how"
            className={styles.title}
            text={"One marketplace.\nTwo ways to find what you need."}
          />
        </div>

        <article className={styles.discover}>
          <div className={styles.wayCopy}>
            <Reveal>
              <p className={styles.wayNumber}>01 — Discover nearby</p>
              <h3 className={styles.wayTitle}>Search products and stores already available around you.</h3>
              <Flow steps={["Search", "Find", "Shop"]} />
            </Reveal>
          </div>
          <DiscoverMock />
        </article>

        <article className={styles.request}>
          <div className={styles.requestCopy}>
            <Reveal>
              <p className={styles.wayNumber}>02 — Request it</p>
              <h3 className={styles.requestTitle}>
                Can&rsquo;t find something? Tell Briz what you need and let nearby sellers respond.
              </h3>
            </Reveal>
            <Reveal delay={0.1}>
              <p className={styles.requestBody}>
                One request goes to the stores most likely to have it. They reply with a price, a distance
                and a note — you compare, then choose.
              </p>
            </Reveal>
          </div>
          <RequestFlow />
        </article>
      </div>
    </section>
  );
}
