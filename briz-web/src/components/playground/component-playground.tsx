"use client";

// A props playground for one component, modelled on Figma's component
// playground: the live component on a canvas, its properties in a panel beside
// it. Generic: each component supplies its controls and a render function.

import { Moon, RotateCcw, Smartphone, Monitor, Sun } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import styles from "./component-playground.module.css";

export type PlaygroundValue = string | boolean;
export type PlaygroundValues = Record<string, PlaygroundValue>;

export type PlaygroundControl =
  | {
      type: "variant";
      key: string;
      label: string;
      options: string[];
      hint?: string;
      /** Values filled in when an option is picked, like choosing a Figma variant; fields stay editable after. */
      presets?: Record<string, PlaygroundValues>;
    }
  | { type: "boolean"; key: string; label: string; hint?: string }
  | { type: "text"; key: string; label: string; multiline?: boolean; inputMode?: "text" | "decimal" | "numeric"; hint?: string }
  | { type: "group"; label: string };

export type PlaygroundWidth = "desktop" | "phone";

type Props = {
  /** Component name, as in Figma. */
  title: string;
  controls: PlaygroundControl[];
  defaults: PlaygroundValues;
  /** Renders the component for the current values and canvas width. */
  render: (values: PlaygroundValues, width: PlaygroundWidth) => ReactNode;
  /** Canvas widths, in px, for the desktop and phone previews. */
  widths?: Record<PlaygroundWidth, number>;
};

export function ComponentPlayground({ title, controls, defaults, render, widths = { desktop: 784, phone: 375 } }: Props) {
  const [values, setValues] = useState<PlaygroundValues>(defaults);
  const [dark, setDark] = useState(false);
  const [width, setWidth] = useState<PlaygroundWidth>("desktop");
  const id = useId();
  const set = (key: string, value: PlaygroundValue) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <div className={styles.playground}>
      <div className={styles.bar}>
        <span>Component playground</span>
        <div className={styles.barTools}>
          <div className={styles.segmented} role="group" aria-label="Preview width">
            <button type="button" aria-pressed={width === "desktop"} aria-label="Desktop width" title="Desktop width" onClick={() => setWidth("desktop")}>
              <Monitor size={16} aria-hidden="true" />
            </button>
            <button type="button" aria-pressed={width === "phone"} aria-label="Phone width" title="Phone width" onClick={() => setWidth("phone")}>
              <Smartphone size={16} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.segmented} role="group" aria-label="Canvas background">
            <button type="button" aria-pressed={!dark} aria-label="Light canvas" title="Light canvas" onClick={() => setDark(false)}>
              <Sun size={16} aria-hidden="true" />
            </button>
            <button type="button" aria-pressed={dark} aria-label="Dark canvas" title="Dark canvas" onClick={() => setDark(true)}>
              <Moon size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.canvas} data-dark={dark} aria-label={`${title} preview`}>
          <div className={styles.stage} style={{ width: widths[width] }}>
            {render(values, width)}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>{title}</h3>
            <button type="button" className={styles.reset} aria-label="Reset all properties" title="Reset" onClick={() => setValues(defaults)}>
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          </div>

          {controls.map((control, index) => {
            if (control.type === "group") {
              return (
                <p key={`group-${index}`} className={styles.group}>
                  {control.label}
                </p>
              );
            }
            const fieldId = `${id}-${control.key}`;
            const value = values[control.key];
            return (
              <div key={control.key} className={styles.row} data-type={control.type}>
                <label htmlFor={fieldId} className={styles.label}>
                  {control.label}
                  {control.hint && <span className={styles.hint}>{control.hint}</span>}
                </label>
                {control.type === "variant" && (
                  <select
                    id={fieldId}
                    className={styles.select}
                    value={String(value)}
                    onChange={(event) => {
                      const option = event.target.value;
                      setValues((current) => ({ ...current, [control.key]: option, ...(control.presets?.[option] ?? {}) }));
                    }}
                  >
                    {control.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                {control.type === "boolean" && (
                  <button
                    id={fieldId}
                    type="button"
                    role="switch"
                    aria-checked={Boolean(value)}
                    className={styles.switch}
                    onClick={() => set(control.key, !value)}
                  >
                    <span aria-hidden="true" />
                  </button>
                )}
                {control.type === "text" &&
                  (control.multiline ? (
                    <textarea id={fieldId} className={styles.input} rows={3} value={String(value)} onChange={(event) => set(control.key, event.target.value)} />
                  ) : (
                    <input
                      id={fieldId}
                      className={styles.input}
                      inputMode={control.inputMode}
                      value={String(value)}
                      onChange={(event) => set(control.key, event.target.value)}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
