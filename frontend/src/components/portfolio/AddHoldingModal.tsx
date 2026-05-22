"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { AddHoldingInput, Holding, UpdateHoldingInput } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECTORS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Energy",
  "Consumer",
  "Industrial",
  "Materials",
  "Utilities",
  "Other",
] as const;

type FormState = {
  symbol: string;
  company_name: string;
  quantity: string;
  buy_price: string;
  buy_date: string;
  sector: string;
};

interface AddHoldingModalProps {
  open: boolean;
  mode?: "add" | "edit";
  holding?: Holding | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: AddHoldingInput | UpdateHoldingInput) => Promise<void>;
}

const emptyForm: FormState = {
  symbol: "",
  company_name: "",
  quantity: "",
  buy_price: "",
  buy_date: "",
  sector: "",
};

export function AddHoldingModal({
  open,
  mode = "add",
  holding,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddHoldingModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && holding) {
      setForm({
        symbol: holding.symbol,
        company_name: holding.company_name,
        quantity: String(holding.quantity),
        buy_price: String(holding.buy_price),
        buy_date: holding.buy_date,
        sector: holding.sector || "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, mode, holding]);

  if (!open) return null;

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.symbol.trim()) nextErrors.symbol = "Symbol is required";
    if (!form.company_name.trim()) nextErrors.company_name = "Company name is required";
    if (!form.quantity || Number(form.quantity) <= 0) {
      nextErrors.quantity = "Quantity must be greater than 0";
    }
    if (!form.buy_price || Number(form.buy_price) <= 0) {
      nextErrors.buy_price = "Buy price must be greater than 0";
    }
    if (!form.buy_date) nextErrors.buy_date = "Buy date is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    if (mode === "edit") {
      await onSubmit({
        quantity: Number(form.quantity),
        buy_price: Number(form.buy_price),
        buy_date: form.buy_date,
        sector: form.sector || undefined,
      });
      return;
    }

    await onSubmit({
      symbol: form.symbol.trim().toUpperCase(),
      company_name: form.company_name.trim(),
      quantity: Number(form.quantity),
      buy_price: Number(form.buy_price),
      buy_date: form.buy_date,
      sector: form.sector || undefined,
    });
  };

  const updateField = (field: keyof FormState, value: string) => {
    const normalized =
      field === "symbol" ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [field]: normalized }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-xl border border-white/10 bg-[#182135] p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            {mode === "edit" ? "Edit Holding" : "Add Holding"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-secondary hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Stock Symbol" error={errors.symbol}>
            <input
              value={form.symbol}
              onChange={(e) => updateField("symbol", e.target.value)}
              disabled={mode === "edit"}
              className={inputClass(errors.symbol)}
              placeholder="AAPL"
            />
          </Field>

          <Field label="Company Name" error={errors.company_name}>
            <input
              value={form.company_name}
              onChange={(e) => updateField("company_name", e.target.value)}
              disabled={mode === "edit"}
              className={inputClass(errors.company_name)}
              placeholder="Apple Inc."
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Quantity" error={errors.quantity}>
              <input
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
                className={inputClass(errors.quantity)}
                placeholder="10"
              />
            </Field>

            <Field label="Buy Price" error={errors.buy_price}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.buy_price}
                  onChange={(e) => updateField("buy_price", e.target.value)}
                  className={cn(inputClass(errors.buy_price), "pl-7")}
                  placeholder="150.00"
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Buy Date" error={errors.buy_date}>
              <input
                type="date"
                value={form.buy_date}
                onChange={(e) => updateField("buy_date", e.target.value)}
                className={inputClass(errors.buy_date)}
              />
            </Field>

            <Field label="Sector">
              <select
                value={form.sector}
                onChange={(e) => updateField("sector", e.target.value)}
                className={inputClass()}
              >
                <option value="">Select sector (optional)</option>
                {SECTORS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/10 bg-transparent text-text-primary hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#D4AF37] text-[#0B1020] hover:bg-[#c9a227] disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Save Changes"
                  : "Add Holding"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      {children}
      {error ? <span className="text-xs text-negative">{error}</span> : null}
    </label>
  );
}

function inputClass(error?: string) {
  return cn(
    "w-full rounded-lg border bg-[#131A2E] px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/60 focus:border-[#D4AF37]",
    error ? "border-negative" : "border-white/10",
  );
}
