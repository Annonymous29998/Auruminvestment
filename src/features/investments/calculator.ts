export function estimateProjectedReturn(args: { principalUsd: number; roiPercent: number }) {
  const projected = args.principalUsd * (1 + args.roiPercent / 100)
  return Math.round(projected * 100) / 100
}

export function formatUsd(amount: number) {
  return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

