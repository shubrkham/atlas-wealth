"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPortfolios,
  createPortfolio,
  getHoldings,
  addHolding,
  updateHolding,
  deleteHolding,
  getMultipleQuotes,
  syncUser,
  setupApiAuth,
} from "@/lib/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import type { Holding, AddHoldingInput, UpdateHoldingInput } from "@/types";

function formatCurrency(value: number, _currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function computeSummary(holdings: Holding[]) {
  const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.buy_price, 0);
  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * (h.current_price ?? h.buy_price), 0);
  const totalPnl = totalValue - totalInvested;
  const returnPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  return { totalInvested, totalValue, totalPnl, returnPct };
}

export default function PortfolioPage() {
  const queryClient = useQueryClient();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [form, setForm] = useState({ symbol: "", company_name: "", quantity: "", buy_price: "", buy_date: "", sector: "Technology" });

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

  const { data: portfolios = [], isLoading: portfoliosLoading } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      const list = await getPortfolios();
      if (list.length === 0) {
        const created = await createPortfolio("My Portfolio", "INR");
        return [created];
      }
      return list;
    },
    enabled: canSync && syncQuery.isSuccess,
  });

  const currentPortfolio = portfolios[0];
  const portfolioId = currentPortfolio?.id;

  const { data: holdings = [], isLoading: holdingsLoading } = useQuery({
    queryKey: ["holdings", portfolioId],
    queryFn: () => getHoldings(portfolioId!),
    enabled: !!portfolioId,
  });

  const symbols = holdings.map((h) => h.symbol);
  const { data: liveQuotes } = useQuery({
    queryKey: ["quotes", symbols],
    queryFn: () => getMultipleQuotes(symbols),
    enabled: symbols.length > 0,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const holdingsWithPrices: Holding[] = holdings.map((h) => {
    const quote = liveQuotes?.[h.symbol];
    if (!quote?.price) return h;
    const currentPrice = quote.price;
    const currentValue = h.quantity * currentPrice;
    const invested = h.quantity * h.buy_price;
    const pnl = currentValue - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    return { ...h, current_price: currentPrice, current_value: currentValue, pnl, pnl_pct: pnlPct, day_change: quote.change ?? 0, day_change_pct: quote.change_pct ?? 0 };
  });

  const summary = useMemo(() => computeSummary(holdingsWithPrices), [holdingsWithPrices]);

  const addMutation = useMutation({
    mutationFn: (data: AddHoldingInput) => addHolding(portfolioId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["holdings", portfolioId] }); setModalOpen(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHoldingInput }) => updateHolding(portfolioId!, id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["holdings", portfolioId] }); setModalOpen(false); setEditingHolding(null); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (holdingId: string) => deleteHolding(portfolioId!, holdingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["holdings", portfolioId] }),
  });

  function resetForm() { setForm({ symbol: "", company_name: "", quantity: "", buy_price: "", buy_date: "", sector: "Technology" }); }
  function openAdd() { setEditingHolding(null); resetForm(); setModalOpen(true); }
  function openEdit(h: Holding) { setEditingHolding(h); setForm({ symbol: h.symbol, company_name: h.company_name, quantity: String(h.quantity), buy_price: String(h.buy_price), buy_date: h.buy_date, sector: h.sector || "Technology" }); setModalOpen(true); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { symbol: form.symbol.toUpperCase(), company_name: form.company_name, quantity: parseFloat(form.quantity), buy_price: parseFloat(form.buy_price), buy_date: form.buy_date, sector: form.sector };
    if (editingHolding) { updateMutation.mutate({ id: editingHolding.id, data: payload }); }
    else { addMutation.mutate(payload); }
  }

  const isSubmitting = addMutation.isPending || updateMutation.isPending;
  const currency = currentPortfolio?.currency ?? "INR";

  if (portfoliosLoading || !syncQuery.isSuccess) {
    return <div style={{ padding: 24, color: "#A3ADC2" }}>Loading portfolio...</div>;
  }

  return (
    <div style={{ padding: 24, background: "#0B1020", minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#F4F6F9" }}>Portfolio</h1>
          {currentPortfolio && <p style={{ margin: "4px 0 0", fontSize: 14, color: "#A3ADC2" }}>{currentPortfolio.name} · {currentPortfolio.currency}</p>}
        </div>
        <button onClick={openAdd} disabled={!portfolioId} style={{ display: "flex", alignItems: "center", gap: 8, background: "#D4AF37", color: "#0B1020", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={16} /> Add Holding
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Value", value: formatCurrency(summary.totalValue), color: "#F4F6F9" },
          { label: "Total Invested", value: formatCurrency(summary.totalInvested), color: "#F4F6F9" },
          { label: "Total P&L", value: formatCurrency(summary.totalPnl, currency), color: summary.totalPnl >= 0 ? "#10B981" : "#EF4444" },
          { label: "Return %", value: formatPercent(summary.returnPct), color: summary.returnPct >= 0 ? "#10B981" : "#EF4444" },
        ].map((card) => (
          <div key={card.label} style={{ background: "#182135", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#A3ADC2", textTransform: "uppercase", letterSpacing: 1 }}>{card.label}</p>
            <p style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#182135", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
        {holdingsLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#A3ADC2" }}>Loading holdings...</div>
        ) : holdingsWithPrices.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <p style={{ color: "#A3ADC2", margin: 0 }}>No holdings yet.</p>
            <button onClick={openAdd} style={{ marginTop: 16, background: "none", border: "none", color: "#D4AF37", cursor: "pointer", textDecoration: "underline", fontSize: 14 }}>Add your first stock</button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Symbol", "Company", "Qty", "Buy Price", "Current Price", "Day Change", "Market Value", "P&L", "P&L %", "Actions"].map((col) => (
                    <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "#A3ADC2", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdingsWithPrices.map((h) => (
                  <tr key={h.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "14px 16px" }}><span style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", padding: "3px 8px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{h.symbol}</span></td>
                    <td style={{ padding: "14px 16px", color: "#F4F6F9" }}>{h.company_name}</td>
                    <td style={{ padding: "14px 16px", color: "#A3ADC2" }}>{h.quantity}</td>
                    <td style={{ padding: "14px 16px", color: "#A3ADC2" }}>{formatCurrency(h.buy_price, currency)}</td>
                    <td style={{ padding: "14px 16px", color: "#F4F6F9" }}>{h.current_price ? formatCurrency(h.current_price, currency) : "—"}</td>
                    <td style={{ padding: "14px 16px", color: (h.day_change ?? 0) >= 0 ? "#10B981" : "#EF4444" }}>{h.day_change != null ? `${(h.day_change ?? 0) >= 0 ? "+" : ""}${h.day_change.toFixed(2)}` : "—"}</td>
                    <td style={{ padding: "14px 16px", color: "#F4F6F9" }}>{formatCurrency(h.current_value ?? h.quantity * h.buy_price, currency)}</td>
                    <td style={{ padding: "14px 16px", color: (h.pnl ?? 0) >= 0 ? "#10B981" : "#EF4444" }}>{formatCurrency(h.pnl ?? 0, currency)}</td>
                    <td style={{ padding: "14px 16px", color: (h.pnl_pct ?? 0) >= 0 ? "#10B981" : "#EF4444" }}>{formatPercent(h.pnl_pct ?? 0)}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={() => openEdit(h)} style={{ background: "none", border: "none", color: "#A3ADC2", cursor: "pointer", fontSize: 13 }}>Edit</button>
                        <button onClick={() => { if (confirm(`Delete ${h.symbol}?`)) deleteMutation.mutate(h.id); }} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 13 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#182135", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480 }}>
            <h2 style={{ margin: "0 0 24px", color: "#F4F6F9", fontSize: 20, fontWeight: 700 }}>{editingHolding ? "Edit Holding" : "Add Holding"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Symbol", key: "symbol", type: "text", placeholder: "AAPL" },
                  { label: "Company Name", key: "company_name", type: "text", placeholder: "Apple Inc" },
                  { label: "Buy Price ($)", key: "buy_price", type: "number", placeholder: "150.00" },
                  { label: "Quantity", key: "quantity", type: "number", placeholder: "10" },
                  { label: "Buy Date", key: "buy_date", type: "date", placeholder: "" },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: "block", fontSize: 12, color: "#A3ADC2", marginBottom: 6 }}>{field.label}</label>
                    <input
                      required
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field.key]: field.key === "symbol" ? e.target.value.toUpperCase() : e.target.value })}
                      style={{ width: "100%", background: "#0B1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#F4F6F9", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#A3ADC2", marginBottom: 6 }}>Sector</label>
                  <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} style={{ width: "100%", background: "#0B1020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#F4F6F9", fontSize: 14 }}>
                    {["Technology", "Finance", "Healthcare", "Energy", "Consumer", "Industrial", "Materials", "Utilities", "Other"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => { setModalOpen(false); setEditingHolding(null); resetForm(); }} style={{ flex: 1, background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px", color: "#A3ADC2", cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, background: "#D4AF37", border: "none", borderRadius: 8, padding: "12px", color: "#0B1020", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  {isSubmitting ? "Saving..." : editingHolding ? "Save Changes" : "Add Holding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}