"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Shield } from "lucide-react";
import { useEffect } from "react";
import {
  createPortfolio,
  getPortfolioRisk,
  getPortfolios,
  setupApiAuth,
  syncUser,
} from "@/lib/api";

interface PortfolioRiskResponse {
  health_score: number;
  diversification_score: number;
  concentration_risk: number;
  top_holding_pct: number;
  sector_distribution: Array<{ sector: string; percentage: number; value: number }>;
  holdings_count: number;
  risk_level: string;
  risk_factors: string[];
}

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

const defaultRisk: PortfolioRiskResponse = {
  health_score: 0,
  diversification_score: 0,
  concentration_risk: 0,
  top_holding_pct: 0,
  sector_distribution: [],
  holdings_count: 0,
  risk_level: "Low",
  risk_factors: [],
};

function mergeRisk(data: PortfolioRiskResponse | undefined): PortfolioRiskResponse {
  if (!data) return defaultRisk;
  return {
    ...defaultRisk,
    ...data,
    sector_distribution: data.sector_distribution ?? [],
    risk_factors: data.risk_factors ?? [],
  };
}

function money(value: number | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

function healthColor(score: number) {
  if (score > 70) return C.positive;
  if (score > 40) return C.accent;
  return C.negative;
}

function riskBadgeStyle(level: string) {
  if (level === "Low") return { bg: "rgba(16,185,129,0.15)", color: C.positive, border: "rgba(16,185,129,0.35)" };
  if (level === "Medium") return { bg: "rgba(212,175,55,0.15)", color: C.accent, border: "rgba(212,175,55,0.35)" };
  return { bg: "rgba(239,68,68,0.15)", color: C.negative, border: "rgba(239,68,68,0.35)" };
}

function ScoreCard({ label, value, suffix, valueColor }: {
  label: string;
  value: string | number;
  suffix?: string;
  valueColor?: string;
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 28px", flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 13, color: C.muted, fontWeight: 500 }}>{label}</p>
      <p style={{ margin: "12px 0 0", fontSize: 42, fontWeight: 700, color: valueColor ?? C.text, lineHeight: 1 }}>
        {value}
        {suffix && <span style={{ fontSize: 20, fontWeight: 500, color: C.muted, marginLeft: 4 }}>{suffix}</span>}
      </p>
    </div>
  );
}

function RiskFactors({ factors }: { factors: string[] }) {
  if (factors.length === 0) {
    return <p style={{ margin: 0, fontSize: 14, color: C.muted }}>No risk factors reported.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {factors.map((factor) => (
        <div key={factor} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "14px 16px" }}>
          <AlertTriangle size={18} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 14, color: C.text, lineHeight: 1.45 }}>{factor}</span>
        </div>
      ))}
    </div>
  );
}

function SectorChart({ sectors }: { sectors: Array<{ sector: string; percentage: number; value: number }> }) {
  if (sectors.length === 0) {
    return <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>No sector data available.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {sectors.map((item) => (
        <div key={item.sector}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.sector}</span>
            <span style={{ fontSize: 13, color: C.muted }}>{item.percentage.toFixed(1)}% · {money(item.value)}</span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(item.percentage, 100)}%`, borderRadius: 999, background: C.accent, transition: "width 0.4s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RiskPage() {
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
    queryFn: () => syncUser({ clerk_id: user!.id, email: userEmail!, full_name: user!.fullName ?? null }),
    enabled: canSync,
    staleTime: Infinity,
    retry: 1,
  });

  const portfoliosQuery = useQuery({
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

  const portfolioId = portfoliosQuery.data?.[0]?.id;

  const riskQuery = useQuery({
    queryKey: ["portfolio-risk", portfolioId],
    queryFn: () => getPortfolioRisk(portfolioId!),
    enabled: Boolean(portfolioId),
    staleTime: 60_000,
  });

  const risk = mergeRisk(riskQuery.data);
  const isLoading = !canSync || syncQuery.isLoading || portfoliosQuery.isLoading || riskQuery.isLoading;
  const hasNoHoldings = !isLoading && riskQuery.isSuccess && risk.holdings_count === 0;
  const showDashboard = !isLoading && riskQuery.isSuccess && risk.holdings_count > 0;
  const badge = riskBadgeStyle(risk.risk_level);

  return (
    <div style={{ minHeight: "100%", background: C.bg, color: C.text, margin: "-24px", padding: 24 }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Risk Dashboard</h1>
        <p style={{ margin: "8px 0 0", fontSize: 15, color: C.muted }}>Portfolio health analysis</p>
      </header>

      {isLoading && (
        <div style={{ color: C.muted, fontSize: 14 }}>Loading risk analysis...</div>
      )}

      {!isLoading && riskQuery.isError && (
        <div style={{ background: C.card, border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 24, color: C.negative }}>
          Failed to load risk data. Please try again.
        </div>
      )}

      {hasNoHoldings && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
          <Shield size={40} style={{ color: C.muted, marginBottom: 16 }} />
          <p style={{ margin: 0, fontSize: 16, color: C.text, fontWeight: 600 }}>Add holdings to see risk analysis</p>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: C.muted }}>Once you add positions to your portfolio, health scores and sector exposure will appear here.</p>
        </div>
      )}

      {showDashboard && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <ScoreCard label="Portfolio Health Score" value={Math.round(risk.health_score)} suffix="/ 100" valueColor={healthColor(risk.health_score)} />
            <ScoreCard label="Diversification Score" value={Math.round(risk.diversification_score)} suffix="/ 100" />
            <ScoreCard label="Concentration Risk" value={`${risk.concentration_risk.toFixed(1)}%`} valueColor={risk.concentration_risk > 50 ? C.negative : C.text} />
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, minWidth: 220 }}>
              <p style={{ margin: 0, fontSize: 13, color: C.muted, fontWeight: 500 }}>Risk Level</p>
              <span style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", borderRadius: 8, fontSize: 18, fontWeight: 800, letterSpacing: "0.08em", background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                {risk.risk_level.toUpperCase()}
              </span>
              <p style={{ margin: "16px 0 0", fontSize: 13, color: C.muted }}>
                {risk.holdings_count} holding{risk.holdings_count !== 1 ? "s" : ""} · Top position {risk.top_holding_pct.toFixed(1)}%
              </p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, flex: 1, minWidth: 280 }}>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: C.muted, fontWeight: 500 }}>Risk Factors</p>
              <RiskFactors factors={risk.risk_factors} />
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <p style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: C.text }}>Sector Distribution</p>
            <SectorChart sectors={risk.sector_distribution} />
          </div>
        </div>
      )}
    </div>
  );
}