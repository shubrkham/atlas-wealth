"use client";

import { useRouter } from "next/navigation";
import { Shield, TrendingUp, BarChart3, Lock, ArrowRight, Zap } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <TrendingUp size={22} color="#D4AF37" />,
      title: "Live Market Data",
      description: "Real-time stock prices, daily changes, and live P&L calculations powered by Alpha Vantage.",
    },
    {
      icon: <BarChart3 size={22} color="#D4AF37" />,
      title: "Portfolio Analytics",
      description: "Professional charts, allocation breakdowns, and performance tracking across all your holdings.",
    },
    {
      icon: <Shield size={22} color="#D4AF37" />,
      title: "Risk Intelligence",
      description: "Portfolio health scores, diversification analysis, concentration risk, and sector distribution.",
    },
    {
      icon: <Lock size={22} color="#D4AF37" />,
      title: "No Brokerage Access",
      description: "Your brokerage credentials stay private. Manually track any stock, anywhere, securely.",
    },
    {
      icon: <Zap size={22} color="#D4AF37" />,
      title: "Instant Insights",
      description: "Best and worst performers, total returns, and portfolio summaries updated in real time.",
    },
    {
      icon: <ArrowRight size={22} color="#D4AF37" />,
      title: "Multi-Asset Support",
      description: "Track US stocks, Indian NSE stocks, crypto, and more all in one unified dashboard.",
    },
  ];

  return (
    <div style={{ background: "#0B1020", minHeight: "100vh", color: "#F4F6F9", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 80px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(11,16,32,0.9)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#D4AF37", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={18} color="#0B1020" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#F4F6F9", letterSpacing: "-0.02em" }}>Kadam Capital</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => router.push("/login")}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 20px", color: "#A3ADC2", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/register")}
            style={{ background: "#D4AF37", border: "none", borderRadius: 8, padding: "9px 20px", color: "#0B1020", cursor: "pointer", fontSize: 14, fontWeight: 700 }}
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "120px 80px 80px", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 999, padding: "6px 16px", marginBottom: 32 }}>
          <div style={{ width: 6, height: 6, background: "#D4AF37", borderRadius: "50%" }} />
          <span style={{ fontSize: 13, color: "#D4AF37", fontWeight: 500 }}>Professional Portfolio Intelligence</span>
        </div>

        <h1 style={{ margin: "0 0 24px", fontSize: 64, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#F4F6F9" }}>
          Track your wealth.{" "}
          <span style={{ color: "#D4AF37" }}>Master your portfolio.</span>
        </h1>

        <p style={{ margin: "0 auto 48px", fontSize: 20, color: "#A3ADC2", lineHeight: 1.6, maxWidth: 600 }}>
          Kadam Capital is a professional-grade investment analytics platform. Track stocks, analyze risk, and get real-time insights — without sharing your brokerage credentials.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/register")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#D4AF37", border: "none", borderRadius: 10, padding: "14px 28px", color: "#0B1020", cursor: "pointer", fontSize: 16, fontWeight: 700 }}
          >
            Start Tracking Free
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => router.push("/login")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "14px 28px", color: "#F4F6F9", cursor: "pointer", fontSize: 16, fontWeight: 600 }}
          >
            Sign In
          </button>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: "#A3ADC2" }}>
          Free forever · No credit card · No brokerage access required
        </p>
      </section>

      {/* Stats Bar */}
      <section style={{ padding: "40px 80px", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "center", gap: 80 }}>
        {[
          { value: "Real-time", label: "Market Data" },
          { value: "100%", label: "Privacy First" },
          { value: "Free", label: "Forever Plan" },
          { value: "0", label: "Brokerage Access" },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#D4AF37" }}>{stat.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#A3ADC2" }}>{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ padding: "100px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", color: "#F4F6F9" }}>
            Everything you need to invest smarter
          </h2>
          <p style={{ margin: 0, fontSize: 18, color: "#A3ADC2", maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            Professional tools previously only available to institutional investors.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {features.map((feature) => (
            <div key={feature.title} style={{ background: "#182135", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28, transition: "border-color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
            >
              <div style={{ width: 44, height: 44, background: "rgba(212,175,55,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                {feature.icon}
              </div>
              <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: "#F4F6F9" }}>{feature.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: "#A3ADC2", lineHeight: 1.6 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section style={{ padding: "0 80px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ background: "#131A2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 40, textAlign: "center" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: 2 }}>Live Dashboard</p>
          <h2 style={{ margin: "0 0 16px", fontSize: 36, fontWeight: 800, color: "#F4F6F9", letterSpacing: "-0.03em" }}>See your portfolio at a glance</h2>
          <p style={{ margin: "0 0 40px", fontSize: 16, color: "#A3ADC2" }}>Real-time prices, P&L tracking, and risk analysis in one beautiful interface.</p>

          {/* Mock Dashboard Preview */}
          <div style={{ background: "#0B1020", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Portfolio Value", value: "$48,250.00", color: "#F4F6F9" },
                { label: "Total P&L", value: "+$6,320.00", color: "#10B981" },
                { label: "Return", value: "+15.08%", color: "#10B981" },
                { label: "Invested", value: "$41,930.00", color: "#F4F6F9" },
              ].map((card) => (
                <div key={card.label} style={{ background: "#182135", borderRadius: 10, padding: 16, textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#A3ADC2", textTransform: "uppercase", letterSpacing: 1 }}>{card.label}</p>
                  <p style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 700, color: card.color }}>{card.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#182135", borderRadius: 10, padding: 16, textAlign: "left" }}>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "#A3ADC2" }}>Portfolio Allocation</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {[["AAPL", 35, "#D4AF37"], ["MSFT", 28, "#10B981"], ["GOOGL", 20, "#3B82F6"], ["Other", 17, "#8B5CF6"]].map(([name, pct, color]) => (
                    <div key={name as string} style={{ flex: pct as number, background: color as string, height: 8, borderRadius: 4 }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                  {[["AAPL", "35%", "#D4AF37"], ["MSFT", "28%", "#10B981"], ["GOOGL", "20%", "#3B82F6"]].map(([name, pct, color]) => (
                    <div key={name as string} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color as string }} />
                      <span style={{ fontSize: 12, color: "#A3ADC2" }}>{name} {pct}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#182135", borderRadius: 10, padding: 16, textAlign: "left" }}>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "#A3ADC2" }}>Top Holdings</p>
                {[
                  { symbol: "AAPL", name: "Apple Inc.", pnl: "+22.4%" },
                  { symbol: "MSFT", name: "Microsoft", pnl: "+18.1%" },
                  { symbol: "GOOGL", name: "Alphabet", pnl: "+9.3%" },
                ].map((h) => (
                  <div key={h.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", padding: "2px 7px", borderRadius: 5, fontSize: 12, fontWeight: 700 }}>{h.symbol}</span>
                      <span style={{ fontSize: 13, color: "#A3ADC2" }}>{h.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981" }}>{h.pnl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", color: "#F4F6F9" }}>
          Start tracking your portfolio today
        </h2>
        <p style={{ margin: "0 auto 40px", fontSize: 18, color: "#A3ADC2", maxWidth: 480 }}>
          Join investors who use Kadam Capital to make smarter decisions.
        </p>
        <button
          onClick={() => router.push("/register")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D4AF37", border: "none", borderRadius: 10, padding: "16px 36px", color: "#0B1020", cursor: "pointer", fontSize: 17, fontWeight: 700 }}
        >
          Get Started Free
          <ArrowRight size={20} />
        </button>
        <p style={{ marginTop: 16, fontSize: 13, color: "#A3ADC2" }}>No credit card required</p>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 80px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, background: "#D4AF37", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={13} color="#0B1020" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#F4F6F9" }}>Kadam Capital</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#A3ADC2" }}>© 2026 Kadam Capital. Built for serious investors.</p>
      </footer>
    </div>
  );
}