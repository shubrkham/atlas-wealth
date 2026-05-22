export default function DashboardPage() {
  const metrics = [
    {
      label: "Total Portfolio Value",
      value: "$0.00",
      valueClassName: "text-text-primary",
    },
    {
      label: "Total P&L",
      value: "$0.00",
      valueClassName: "text-positive",
    },
    {
      label: "Portfolio Return",
      value: "0.00%",
      valueClassName: "text-text-primary",
    },
    {
      label: "Best Performer",
      value: "—",
      valueClassName: "text-text-primary",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {metrics.map(({ label, value, valueClassName }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-card p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-text-secondary">{label}</p>
            <p
              className={`mt-3 text-3xl font-semibold tracking-tight ${valueClassName}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-text-secondary">
          Portfolio Growth Chart — Coming Soon
        </p>
      </div>
    </div>
  );
}
