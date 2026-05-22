import { create } from "zustand";
import type { Holding, Portfolio } from "@/types";

interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  holdings: Holding[];
  isLoading: boolean;
  setPortfolios: (portfolios: Portfolio[]) => void;
  setCurrentPortfolio: (portfolio: Portfolio | null) => void;
  setHoldings: (holdings: Holding[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  currentPortfolio: null,
  holdings: [],
  isLoading: false,
  setPortfolios: (portfolios) => set({ portfolios }),
  setCurrentPortfolio: (currentPortfolio) => set({ currentPortfolio }),
  setHoldings: (holdings) => set({ holdings }),
  setLoading: (isLoading) => set({ isLoading }),
}));
