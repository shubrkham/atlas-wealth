import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AddHoldingInput, Holding, Portfolio, UpdateHoldingInput } from "@/types";

/** Clerk getToken — called on each request; Clerk refreshes expired tokens automatically. */
export type GetTokenFn = (options?: { skipCache?: boolean }) => Promise<string | null>;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

let getTokenFn: GetTokenFn | null = null;

export function setupApiAuth(getToken: GetTokenFn) {
  getTokenFn = getToken;
}

async function attachAuthHeader(config: InternalAxiosRequestConfig) {
  if (!getTokenFn) return config;

  const token = await getTokenFn();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

api.interceptors.request.use(attachAuthHeader);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      getTokenFn &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const freshToken = await getTokenFn({ skipCache: true });
      if (freshToken) {
        originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

function mapHolding(raw: Record<string, unknown>): Holding {
  const quantity = Number(raw.quantity);
  const buyPrice = Number(raw.buy_price);
  const currentPrice =
    raw.current_price !== undefined ? Number(raw.current_price) : buyPrice;
  const currentValue = quantity * currentPrice;
  const invested = quantity * buyPrice;
  const pnl = currentValue - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

  return {
    id: String(raw.id),
    portfolio_id: String(raw.portfolio_id),
    symbol: String(raw.symbol),
    company_name: String(raw.company_name ?? ""),
    quantity,
    buy_price: buyPrice,
    buy_date: String(raw.buy_date ?? ""),
    sector: String(raw.sector ?? ""),
    current_price: currentPrice,
    current_value: currentValue,
    pnl,
    pnl_pct: pnlPct,
    day_change: Number(raw.day_change ?? 0),
    day_change_pct: Number(raw.day_change_pct ?? 0),
  };
}

export async function getPortfolios(): Promise<Portfolio[]> {
  const { data } = await api.get<Portfolio[]>("/portfolios");
  return data;
}

export async function createPortfolio(
  name: string,
  currency: string,
): Promise<Portfolio> {
  const { data } = await api.post<Portfolio>("/portfolios", { name, currency });
  return data;
}

export async function getHoldings(portfolioId: string): Promise<Holding[]> {
  const { data } = await api.get<Record<string, unknown>[]>(
    `/portfolios/${portfolioId}/holdings`,
  );
  return data.map(mapHolding);
}

export async function addHolding(
  portfolioId: string,
  payload: AddHoldingInput,
): Promise<Holding> {
  const { data } = await api.post<Record<string, unknown>>(
    `/portfolios/${portfolioId}/holdings`,
    payload,
  );
  return mapHolding(data);
}

export async function updateHolding(
  portfolioId: string,
  holdingId: string,
  payload: UpdateHoldingInput,
): Promise<Holding> {
  const { data } = await api.put<Record<string, unknown>>(
    `/portfolios/${portfolioId}/holdings/${holdingId}`,
    payload,
  );
  return mapHolding(data);
}

export async function deleteHolding(
  portfolioId: string,
  holdingId: string,
): Promise<void> {
  await api.delete(`/portfolios/${portfolioId}/holdings/${holdingId}`);
}
export async function syncUser(payload: { 
  clerk_id: string; 
  email: string; 
  full_name: string | null 
}): Promise<unknown> {
  const { data } = await axios.post('http://localhost:8000/api/v1/auth/sync', payload)
  return data
}
export async function getPortfolioRisk(portfolioId: string) {
  const { data } = await api.get(`/portfolios/${portfolioId}/risk`)
  return data
}
export default api;
