export interface Holding {
  id: string;
  portfolio_id: string;
  symbol: string;
  company_name: string;
  quantity: number;
  buy_price: number;
  buy_date: string;
  sector: string;
  current_price?: number;
  current_value?: number;
  pnl?: number;
  pnl_pct?: number;
  day_change?: number;
  day_change_pct?: number;
}

export interface Portfolio {
  id: string;
  name: string;
  currency: string;
  created_at: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  portfolioReturn: number;
  bestPerformer: string | null;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export type AddHoldingInput = {
  symbol: string;
  company_name: string;
  quantity: number;
  buy_price: number;
  buy_date: string;
  sector?: string;
};

export type UpdateHoldingInput = {
  quantity?: number;
  buy_price?: number;
  buy_date?: string;
  sector?: string;
};
export interface PortfolioRiskResponse {
  health_score: number
  diversification_score: number
  concentration_risk: number
  top_holding_pct: number
  sector_distribution: Array<{ sector: string; percentage: number; value: number }>
  holdings_count: number
  risk_level: string
  risk_factors: string[]
};
