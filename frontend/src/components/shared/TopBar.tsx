"use client";

import { UserButton } from "@clerk/nextjs";

export function TopBar() {
  return (
    <header className="fixed left-[240px] right-0 top-0 z-30 flex h-[60px] items-center justify-between border-b border-white/5 bg-surface px-6">
      <span className="text-xl font-bold tracking-tight text-[#D4AF37]">
        Atlas Wealth
      </span>
      <UserButton
        appearance={{
          variables: {
            colorBackground: "#131A2E",
            colorText: "#F4F6F9",
            colorTextSecondary: "#F4F6F9",
            colorPrimary: "#D4AF37",
          },
          elements: {
            userButtonOuterIdentifier: {
              color: "#F4F6F9",
              fontWeight: "500",
            },
            userButtonTrigger: {
              color: "#F4F6F9",
            },
            userButtonPopoverCard: {
              background: "#131A2E",
              border: "1px solid rgba(255,255,255,0.08)",
            },
            userButtonPopoverActionButton: { color: "#F4F6F9" },
            userButtonPopoverActionButtonText: { color: "#F4F6F9" },
            userPreviewMainIdentifier: { color: "#F4F6F9" },
            userPreviewSecondaryIdentifier: { color: "#A3ADC2" },
          },
        }}
      />
    </header>
  );
}
