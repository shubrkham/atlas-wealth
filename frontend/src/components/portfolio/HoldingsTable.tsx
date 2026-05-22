"use client";

import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { Holding } from "@/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HoldingsTableProps {
  holdings: Holding[];
  isLoading: boolean;
  currency?: string;
  onAdd: () => void;
  onEdit: (holding: Holding) => void;
  onDelete: (holding: Holding) => void;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <tr key={index} className="border-b border-white/5">
          {Array.from({ length: 10 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-4 animate-pulse rounded bg-white/10" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function PnlCell({ value, percent }: { value: number; percent: number }) {
  const isPositive = value >= 0;
  return (
    <div
      className={cn(
        "font-medium tabular-nums",
        isPositive ? "text-positive" : "text-negative",
      )}
    >
      <div>{formatCurrency(value)}</div>
      <div className="text-xs">{formatPercent(percent)}</div>
    </div>
  );
}

function DayChangeCell({
  change,
  changePct,
}: {
  change: number;
  changePct: number;
}) {
  const isPositive = change >= 0;
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <div
      className={cn(
        "flex items-center gap-1 font-medium tabular-nums",
        isPositive ? "text-positive" : "text-negative",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{formatCurrency(Math.abs(change))}</span>
      <span className="text-xs">({formatPercent(changePct)})</span>
    </div>
  );
}

export function HoldingsTable({
  holdings,
  isLoading,
  currency = "USD",
  onAdd,
  onEdit,
  onDelete,
}: HoldingsTableProps) {
  if (!isLoading && holdings.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-white/10 bg-card px-6 py-12 text-center">
        <p className="text-sm text-text-secondary">
          No holdings yet. Add your first stock.
        </p>
        <Button
          onClick={onAdd}
          className="mt-6 bg-[#D4AF37] text-[#0B1020] hover:bg-[#c9a227]"
        >
          <Plus className="size-4" />
          Add Holding
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-surface/80 text-xs uppercase tracking-wide text-text-secondary">
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium text-right">Qty</th>
              <th className="px-4 py-3 font-medium text-right">Buy Price</th>
              <th className="px-4 py-3 font-medium text-right">Current Price</th>
              <th className="px-4 py-3 font-medium text-right">Day Change</th>
              <th className="px-4 py-3 font-medium text-right">Market Value</th>
              <th className="px-4 py-3 font-medium text-right">P&amp;L</th>
              <th className="px-4 py-3 font-medium text-right">P&amp;L%</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : (
              holdings.map((holding) => {
                const currentPrice = holding.current_price ?? holding.buy_price;
                const currentValue = holding.current_value ?? holding.quantity * currentPrice;
                const pnl = holding.pnl ?? currentValue - holding.quantity * holding.buy_price;
                const pnlPct =
                  holding.pnl_pct ??
                  (holding.quantity * holding.buy_price > 0
                    ? (pnl / (holding.quantity * holding.buy_price)) * 100
                    : 0);
                const dayChange = holding.day_change ?? 0;
                const dayChangePct = holding.day_change_pct ?? 0;

                return (
                  <tr
                    key={holding.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-md bg-[#D4AF37]/15 px-2.5 py-1 text-xs font-bold tracking-wide text-[#D4AF37]">
                        {holding.symbol}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-primary">
                      {holding.company_name}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-text-primary">
                      {formatNumber(holding.quantity, 2)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-text-primary">
                      {formatCurrency(holding.buy_price, currency)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-text-primary">
                      {formatCurrency(currentPrice, currency)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <DayChangeCell
                        change={dayChange}
                        changePct={dayChangePct}
                      />
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-text-primary">
                      {formatCurrency(currentValue, currency)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <PnlCell value={pnl} percent={pnlPct} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={cn(
                          "font-medium tabular-nums",
                          pnlPct >= 0 ? "text-positive" : "text-negative",
                        )}
                      >
                        {formatPercent(pnlPct)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(holding)}
                          className="rounded-lg border border-white/10 p-2 text-text-secondary transition-colors hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
                          aria-label={`Edit ${holding.symbol}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(holding)}
                          className="rounded-lg border border-white/10 p-2 text-text-secondary transition-colors hover:border-negative/40 hover:text-negative"
                          aria-label={`Delete ${holding.symbol}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
