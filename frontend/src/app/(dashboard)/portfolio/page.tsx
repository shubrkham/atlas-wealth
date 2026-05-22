// Get symbols from holdings
const symbols = holdings.map((h) => h.symbol)

// Fetch live prices
const { data: liveQuotes } = useLivePrices(symbols)

// Merge live prices into holdings
const holdingsWithPrices = holdings.map((h) => {
  const quote = liveQuotes?.[h.symbol]
  if (!quote || !quote.price) return h
  const currentPrice = quote.price
  const currentValue = h.quantity * currentPrice
  const invested = h.quantity * h.buy_price
  const pnl = currentValue - invested
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0
  return {
    ...h,
    current_price: currentPrice,
    current_value: currentValue,
    pnl,
    pnl_pct: pnlPct,
    day_change: quote.change ?? 0,
    day_change_pct: quote.change_pct ?? 0,
  }
})