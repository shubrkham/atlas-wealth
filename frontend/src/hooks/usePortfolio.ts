"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addHolding,
  createPortfolio,
  deleteHolding,
  getHoldings,
  getPortfolios,
  updateHolding,
} from "@/lib/api";
import type { AddHoldingInput, UpdateHoldingInput } from "@/types";

export const portfolioKeys = {
  all: ["portfolios"] as const,
  holdings: (portfolioId: string) => ["holdings", portfolioId] as const,
};

const DEFAULT_PORTFOLIO_NAME = "My Portfolio";

export function usePortfolios() {
  return useQuery({
    queryKey: portfolioKeys.all,
    queryFn: async () => {
      const portfolios = await getPortfolios();
      if (portfolios.length === 0) {
        const created = await createPortfolio(DEFAULT_PORTFOLIO_NAME, "USD");
        return [created];
      }
      return portfolios;
    },
  });
}

export function useHoldings(portfolioId: string | undefined) {
  return useQuery({
    queryKey: portfolioKeys.holdings(portfolioId ?? ""),
    queryFn: () => getHoldings(portfolioId!),
    enabled: Boolean(portfolioId),
  });
}

export function useAddHolding(portfolioId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddHoldingInput) => addHolding(portfolioId!, data),
    onSuccess: async () => {
      if (portfolioId) {
        await queryClient.invalidateQueries({
          queryKey: portfolioKeys.holdings(portfolioId),
        });
      }
    },
  });
}

export function useUpdateHolding(portfolioId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      holdingId,
      data,
    }: {
      holdingId: string;
      data: UpdateHoldingInput;
    }) => updateHolding(portfolioId!, holdingId, data),
    onSuccess: async () => {
      if (portfolioId) {
        await queryClient.invalidateQueries({
          queryKey: portfolioKeys.holdings(portfolioId),
        });
      }
    },
  });
}

export function useDeleteHolding(portfolioId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (holdingId: string) => deleteHolding(portfolioId!, holdingId),
    onSuccess: async () => {
      if (portfolioId) {
        await queryClient.invalidateQueries({
          queryKey: portfolioKeys.holdings(portfolioId),
        });
      }
    },
  });
}
