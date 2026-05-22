export async function getQuote(symbol: string): Promise<{
  symbol: string
  price: number | null
  change: number | null
  change_pct: number | null
  error?: string
}> {
  const { data } = await api.get(`/market/quote?symbol=${symbol}`)
  return data
}

export async function getMultipleQuotes(symbols: string[]): Promise
  Record<string, {
    symbol: string
    price: number | null
    change: number | null
    change_pct: number | null
    error?: string
  }>
> {
  const { data } = await api.get(`/market/quotes?symbols=${symbols.join(",")}`)
  return data
}

export async function searchSymbols(query: string): Promise<{
  results: Array<{ symbol: string; name: string; type: string; region: string }>
}> {
  const { data } = await api.get(`/market/search?q=${encodeURIComponent(query)}`)
  return data
}