"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getPortfolios,
  getHoldings,
  getMultipleQuotes,
  createPortfolio,
  syncUser,
  setupApiAuth,
} from "@/lib/api";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

const CHART_COLORS = [
  "#D4AF37", "#10B981", "#3B82F6", "#8B5CF6",
  "#F59E0B", "#EF4444", "#06B6D4", "#84CC16",
];

const C = {
  bg: "#0B1020",
  card: "#182135",
  text: "#F4F6F9",
  muted: "#A3ADC2",
  accent: "#D4AF37",
  positive: "#10B981",
  negative: "#EF4444",
  border: "rgba(255,255,255,0.08)",
};

export default function DashboardPage() {
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    if (authLoaded) {
      setupApiAuth((opts?: { skipCache?: boolean }) =>
        getToken(opts?.skipCache ? { skipCache: true } : undefined)
      );
    }
  }, [getToken, authLoaded]);

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const canSync = authLoaded && userLoaded && Boolean(user?.id && userEmail);

  const syncQuery = useQuery({
    queryKey: ["auth-sync", user?.id],
    queryFn: () =>
      syncUser({
        clerk_id: user!.id,
        email: userEmail!,
        full_name: user!.fullName ?? null,
      }),
    enabled: canSync,
    staleTime: Infinity,
    retry: 1,
  });

  const { data: portfolios = [] } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      const list = await getPortfolios();
      if (list.length === 0) {
        const created = await createPortfolio("My Portfolio", "USD");
        return [created];
      }
      return list;
    },
    enabled: canSync && syncQuery.isSuccess,
  });

  const portfolioId = portfolios[0]?.id;

  const { data: holdings = [] } = useQuery({
    queryKey: ["holdings", portfolioId],
    queryFn: () => getHoldings(portfolioId!),
    enabled: !!portfolioId,
  });

  const symbols = holdings.map((h) => h.symbol);

  const { data: liveQuotes } = useQuery({
    queryKey: ["quotes", symbols],
    queryFn: () => getMultipleQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 30000,
  });

  const holdingsWithPrices = holdings.map((h) => {
    const quote = liveQuotes?.[h.symbol];
    if (!quote?.price) return h;
    const currentPrice = quote.price;
    const currentValue = h.quantity * currentPrice;
    const invested = h.quantity * h.buy_price;
    const pnl = currentValue - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    return { ...h, current_price: currentPrice, current_value: currentValue, pnl, pnl_pct: pnlPct };
  });

  const totalInvested = holdingsWithPrices.reduce((sum, h) => sum + h.quantity * h.buy_price, 0);
  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.quantity * (h.current_price ?? h.buy_price), 0);
  const totalPnl = totalValue - totalInvested;
  const returnPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const bestPerformer = holdingsWithPrices.length > 0
    ? holdingsWithPrices.reduce((best, h) => (h.pnl_pct ?? 0) > (best?.pnl_pct ?? -Infinity) ? h : best, holdingsWithPrices[0])
    : null;

  const worstPerformer = holdingsWithPrices.length > 0
    ? holdingsWithPrices.reduce((worst, h) => (h.pnl_pct ?? 0) < (worst?.pnl_pct ?? Infinity) ? h : worst, holdingsWithPrices[0])
    : null;

  const allocationData = holdingsWithPrices.map((h) => ({
    name: h.symbol,
    value: Math.round(((h.current_value ?? h.quantity * h.buy_price) / totalValue) * 100),
  }));

  const pnlData = holdingsWithPrices.map((h) => ({
    name: h.symbol,
    pnl: parseFloat((h.pnl ?? 0).toFixed(2)),
    fill: (h.pnl ?? 0) >= 0 ? C.positive : C.negative,
  }));

  const metrics = [
    { label: "Total Portfolio Value", value: formatCurrency(totalValue), color: C.text },
    { label: "Total P&L", value: formatCurrency(totalPnl), color: totalPnl >= 0 ? C.positive : C.negative },
    { label: "Portfolio Return", value: formatPercent(returnPct), color: returnPct >= 0 ? C.positive : C.negative },
    { label: "Total Invested", value: formatCurrency(totalInvested), color: C.text },
  ];

  return (
    <div style={{ padding: 24, background: C.bg, minHeight: "100%" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.text }}>Dashboard</h1>
        <p style={{ margin: "6px 0 0", fontSize: 15, color: C.muted }}>
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>{m.label}</p>
            <p style={{ margin: "10px 0 0", fontSize: 24, fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Best / Worst */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>Best Performer</p>
          {bestPerformer ? (
            <div>
              <span style={{ background: "rgba(212,175,55,0.15)", color: C.accent, padding: "4px 10px", borderRadius: 6, fontSize: 14, fontWeight: 700 }}>{bestPerformer.symbol}</span>
              <p style={{ margin: "12px 0 0", fontSize: 28, fontWeight: 700, color: C.positive }}>{formatPercent(bestPerformer.pnl_pct ?? 0)}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>{bestPerformer.company_name}</p>
            </div>
          ) : (
            <p style={{ color: C.muted, fontSize: 14 }}>No holdings yet</p>
          )}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>Worst Performer</p>
          {worstPerformer ? (
            <div>
              <span style={{ background: "rgba(212,175,55,0.15)", color: C.accent, padding: "4px 10px", borderRadius: 6, fontSize: 14, fontWeight: 700 }}>{worstPerformer.symbol}</span>
              <p style={{ margin: "12px 0 0", fontSize: 28, fontWeight: 700, color: C.negative }}>{formatPercent(worstPerformer.pnl_pct ?? 0)}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>{worstPerformer.company_name}</p>
            </div>
          ) : (
            <p style={{ color: C.muted, fontSize: 14 }}>No holdings yet</p>
          )}
        </div>
      </div>

      {/* Charts */}
      {holdingsWithPrices.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Allocation Pie */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <p style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: C.text }}>Portfolio Allocation</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }}
                  formatter={(value) => [`${value}%`, "Allocation"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
              {allocationData.map((item, index) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span style={{ fontSize: 13, color: C.muted }}>{item.name} {item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* P&L Bar Chart */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <p style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: C.text }}>P&L by Stock</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pnlData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }}
                  formatter={(value) => [formatCurrency(Number(value)), "P&L"]}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {pnlData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Holdings Summary */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
        <p style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: C.text }}>Holdings Summary</p>
        {holdingsWithPrices.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 14 }}>No holdings yet. Go to Portfolio to add stocks.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {holdingsWithPrices.map((h) => (
              <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ background: "rgba(212,175,55,0.15)", color: C.accent, padding: "3px 8px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{h.symbol}</span>
                  <span style={{ fontSize: 14, color: C.muted }}>{h.company_name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>{formatCurrency(h.current_value ?? h.quantity * h.buy_price)}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: (h.pnl_pct ?? 0) >= 0 ? C.positive : C.negative }}>{formatPercent(h.pnl_pct ?? 0)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}