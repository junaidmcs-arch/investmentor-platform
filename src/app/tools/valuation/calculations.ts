export type ValuationInputs = {
  eps: number;
  multiple: number;
  referencePrice: number;
};

export type ValuationResult = {
  estimatedValue: number;
  priceDifference: number;
  priceDifferencePercent: number;
};

/** A teaching exercise for positive earnings, not a security recommendation. */
export function calculatePeValuation({ eps, multiple, referencePrice }: ValuationInputs): ValuationResult {
  if (!Number.isFinite(eps) || eps <= 0) throw new RangeError("Enter positive annual earnings per share. This P/E exercise does not support zero or negative earnings.");
  if (!Number.isFinite(multiple) || multiple <= 0) throw new RangeError("Enter a positive assumed P/E multiple.");
  if (!Number.isFinite(referencePrice) || referencePrice <= 0) throw new RangeError("Enter a positive reference price to calculate the percentage difference.");
  const estimatedValue = eps * multiple;
  const priceDifference = estimatedValue - referencePrice;
  const priceDifferencePercent = (priceDifference / referencePrice) * 100;
  if (![estimatedValue, priceDifference, priceDifferencePercent].every(Number.isFinite)) throw new RangeError("These inputs are too large for a meaningful calculation. Use smaller figures.");
  return { estimatedValue, priceDifference, priceDifferencePercent };
}

export function sensitivityGrid(inputs: ValuationInputs) {
  calculatePeValuation(inputs);
  const multiples = [.75, 1, 1.25].map(factor => inputs.multiple * factor);
  const earnings = [.8, 1, 1.2].map(factor => inputs.eps * factor);
  return {
    multiples,
    rows: earnings.map(eps => ({
      eps,
      values: multiples.map(multiple => calculatePeValuation({ ...inputs, eps, multiple }))
    }))
  };
}
