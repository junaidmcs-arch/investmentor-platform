import { describe, expect, it } from "vitest";
import { calculatePeValuation, sensitivityGrid } from "./calculations";

describe("P/E educational valuation", () => {
  it("distinguishes estimated value from its percentage difference to the reference price", () => {
    const result = calculatePeValuation({ eps: 20, multiple: 8, referencePrice: 120 });
    expect(result.estimatedValue).toBe(160);
    expect(result.priceDifference).toBe(40);
    expect(result.priceDifferencePercent).toBeCloseTo(33.333333);
  });
  it("represents a downside assumption without reversing the comparison denominator", () => {
    expect(calculatePeValuation({ eps: 16, multiple: 6, referencePrice: 120 }).priceDifferencePercent).toBe(-20);
  });
  it("supports fractional inputs without rounding intermediate calculations", () => {
    const result = calculatePeValuation({ eps: 2.35, multiple: 7.5, referencePrice: 20 });
    expect(result.estimatedValue).toBeCloseTo(17.625);
    expect(result.priceDifferencePercent).toBeCloseTo(-11.875);
  });
  it.each([0, -1, NaN, Infinity, -Infinity])("rejects invalid price %s instead of generating an infinite percentage", referencePrice => {
    expect(() => calculatePeValuation({ eps: 20, multiple: 8, referencePrice })).toThrow(RangeError);
  });
  it.each([0, -1, NaN, Infinity, -Infinity])("does not pretend P/E is meaningful for invalid earnings %s", eps => {
    expect(() => calculatePeValuation({ eps, multiple: 8, referencePrice: 120 })).toThrow(RangeError);
  });
  it.each([0, -1, NaN, Infinity, -Infinity])("rejects invalid assumed multiple %s", multiple => {
    expect(() => calculatePeValuation({ eps: 20, multiple, referencePrice: 120 })).toThrow(RangeError);
  });
  it("does not silently emit overflow", () => {
    expect(() => calculatePeValuation({ eps: Number.MAX_VALUE, multiple: 2, referencePrice: 1 })).toThrow(RangeError);
  });
  it("keeps the selected assumptions at the center of the sensitivity table", () => {
    const inputs = { eps: 20, multiple: 8, referencePrice: 120 };
    const grid = sensitivityGrid(inputs);
    expect(grid.multiples).toEqual([6, 8, 10]);
    expect(grid.rows.map(row => row.eps)).toEqual([16, 20, 24]);
    expect(grid.rows[1].values[1]).toEqual(calculatePeValuation(inputs));
    expect(grid.rows[0].values[0].estimatedValue).toBe(96);
    expect(grid.rows[2].values[2].estimatedValue).toBe(240);
  });
});
