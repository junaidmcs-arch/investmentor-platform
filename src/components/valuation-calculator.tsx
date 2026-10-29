"use client";

import { useId, useState } from "react";
import { ArrowRight, RotateCcw, SlidersHorizontal } from "lucide-react";
import { calculatePeValuation, sensitivityGrid, type ValuationInputs } from "@/app/tools/valuation/calculations";
import styles from "@/app/tools/valuation/valuation.module.css";

const format = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 });
const percentage = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
const presets = [
  { label: "Starting example", eps: "20", multiple: "8", referencePrice: "120" },
  { label: "Lower earnings & multiple", eps: "16", multiple: "6", referencePrice: "120" },
  { label: "Same earnings, lower multiple", eps: "20", multiple: "6", referencePrice: "120" }
];

export function ValuationCalculator() {
  const inputId = useId();
  const [values, setValues] = useState({ eps: "20", multiple: "8", referencePrice: "120" });
  const inputs: ValuationInputs = {
    eps: values.eps.trim() ? Number(values.eps) : NaN,
    multiple: values.multiple.trim() ? Number(values.multiple) : NaN,
    referencePrice: values.referencePrice.trim() ? Number(values.referencePrice) : NaN
  };
  let error: string | null = null;
  let result: ReturnType<typeof calculatePeValuation> | null = null;
  let grid: ReturnType<typeof sensitivityGrid> | null = null;
  try { result = calculatePeValuation(inputs); grid = sensitivityGrid(inputs); }
  catch (cause) { error = cause instanceof Error ? cause.message : "Please check your inputs."; result = null; }
  const fields = [
    { key: "eps" as const, title: "Annual earnings per share", unit: "PKR", help: "Use a hypothetical positive annual EPS, on a consistent basis." },
    { key: "multiple" as const, title: "Assumed P/E multiple", unit: "×", help: "Your valuation assumption, not a recommended multiple." },
    { key: "referencePrice" as const, title: "Reference price per share", unit: "PKR", help: "A hypothetical comparison price. No live prices are fetched." }
  ];
  const maximumBarValue = result ? Math.max(result.estimatedValue, inputs.referencePrice) : 1;
  return <>
    <div className={styles.lab}>
      <section className={styles.inputs} aria-labelledby={`${inputId}-inputs`}>
        <div className={styles.panelHeading}><span><SlidersHorizontal size={18}/> YOUR ASSUMPTIONS</span><button type="button" onClick={() => setValues({ eps: "20", multiple: "8", referencePrice: "120" })} className={styles.reset}><RotateCcw size={13}/> Reset</button></div>
        <h2 id={`${inputId}-inputs`}>Start with the inputs.</h2>
        <p className={styles.inputIntro}>Adjust one number at a time and notice what changes.</p>
        {fields.map(field => <div className={styles.field} key={field.key}>
          <label htmlFor={`${inputId}-${field.key}`}>{field.title}</label>
          <div className={styles.inputWrap}><input id={`${inputId}-${field.key}`} type="number" inputMode="decimal" min="0.01" step="any" value={values[field.key]} onChange={event => setValues(previous => ({ ...previous, [field.key]: event.target.value }))} aria-describedby={`${inputId}-${field.key}-help`} aria-invalid={!Number.isFinite(inputs[field.key]) || inputs[field.key] <= 0}/><span>{field.unit}</span></div>
          <small id={`${inputId}-${field.key}-help`}>{field.help}</small>
        </div>)}
        <span className={styles.presetLabel}>TRY ANOTHER SET OF ASSUMPTIONS</span>
        <div className={styles.presets}>{presets.map(preset => <button type="button" key={preset.label} aria-pressed={values.eps === preset.eps && values.multiple === preset.multiple && values.referencePrice === preset.referencePrice} onClick={() => setValues({ eps: preset.eps, multiple: preset.multiple, referencePrice: preset.referencePrice })}>{preset.label}<ArrowRight size={13}/></button>)}</div>
      </section>
      <section className={styles.result} aria-labelledby={`${inputId}-result`}>
        <span className={styles.resultEyebrow}>THE OUTPUT — GIVEN YOUR INPUTS</span>
        <h2 id={`${inputId}-result`}>Estimated value per share</h2>
        <div aria-live="polite" aria-atomic="true">
          {result ? <><div className={styles.value}><span>PKR</span> {format.format(result.estimatedValue)}</div><p className={styles.equation}>EPS {format.format(inputs.eps)} <span>×</span> P/E {format.format(inputs.multiple)} <span>=</span> PKR {format.format(result.estimatedValue)}</p>
            <div className={styles.difference}><div><span>Difference from reference price</span><strong>{percentage(result.priceDifferencePercent)}</strong></div><p>{result.priceDifference === 0 ? "The estimate equals the reference price under these assumptions." : `The estimate is PKR ${format.format(Math.abs(result.priceDifference))} ${result.priceDifference > 0 ? "above" : "below"} the reference price under these assumptions.`}</p></div></> : <div className={styles.validation} role="status"><h3>Check the assumptions.</h3><p>{error}</p></div>}
        </div>
        {result && <div className={styles.bars} aria-label="Comparison of hypothetical reference price and estimated value">
          <div className={styles.barRow}><div><span>Reference price</span><strong>PKR {format.format(inputs.referencePrice)}</strong></div><div className={styles.barTrack}><span className={styles.referenceBar} style={{ width: `${inputs.referencePrice / maximumBarValue * 100}%` }}/></div></div>
          <div className={styles.barRow}><div><span>Estimated value</span><strong>PKR {format.format(result.estimatedValue)}</strong></div><div className={styles.barTrack}><span className={styles.estimateBar} style={{ width: `${result.estimatedValue / maximumBarValue * 100}%` }}/></div></div>
        </div>}
        <div className={styles.resultNote}><span>READ THE RESULT WITH CARE</span><p>This is an assumption-dependent estimate. It does not predict whether, or when, any market price will reach this value.</p></div>
      </section>
    </div>
    <section className={styles.sensitivity} aria-labelledby={`${inputId}-sensitivity`}>
      <div className={styles.sensitivityIntro}><span className="eyebrow">LOOK BEYOND ONE NUMBER</span><h2 id={`${inputId}-sensitivity`}>What if the assumptions change?</h2><p>The table varies annual EPS by ±20% and your assumed multiple by ±25%. These are illustrative changes, with no probabilities attached.</p></div>
      {grid && result ? <div className={styles.tableWrap}><table><caption>Estimated value per share in PKR. Rows change EPS; columns change the assumed P/E multiple.</caption><thead><tr><th scope="col">Annual EPS</th>{grid.multiples.map((multiple, index) => <th key={index} scope="col">{format.format(multiple)}× P/E{index === 1 && <span>Your multiple</span>}</th>)}</tr></thead><tbody>{grid.rows.map((row, rowIndex) => <tr key={rowIndex}><th scope="row">PKR {format.format(row.eps)}{rowIndex === 1 && <span>Your EPS</span>}</th>{row.values.map((value, columnIndex) => <td key={columnIndex} className={rowIndex === 1 && columnIndex === 1 ? styles.currentCell : undefined}><strong>{format.format(value.estimatedValue)}</strong><span>{percentage(value.priceDifferencePercent)} vs reference</span>{rowIndex === 1 && columnIndex === 1 && <small>YOUR INPUTS</small>}</td>)}</tr>)}</tbody></table></div> : <div className={styles.tableEmpty}>Enter valid positive inputs to explore the sensitivity table.</div>}
    </section>
  </>;
}
