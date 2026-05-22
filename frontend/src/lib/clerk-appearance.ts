export const clerkDarkAppearance = {
  variables: {
    colorBackground: "#0B1020",
    colorInputBackground: "#182135",
    colorInputText: "#F4F6F9",
    colorText: "#F4F6F9",
    colorTextSecondary: "#A3ADC2",
    colorPrimary: "#D4AF37",
    colorDanger: "#EF4444",
    colorSuccess: "#10B981",
    colorNeutral: "#A3ADC2",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "bg-[#182135] border border-white/10 shadow-xl",
    headerTitle: "text-[#F4F6F9]",
    headerSubtitle: "text-[#A3ADC2]",
    socialButtonsBlockButton:
      "bg-[#131A2E] border border-white/10 text-[#F4F6F9] hover:bg-[#182135]",
    formButtonPrimary:
      "bg-[#D4AF37] text-[#0B1020] hover:bg-[#c9a227] border-0",
    footerActionLink: "text-[#D4AF37] hover:text-[#e8c547]",
    formFieldInput:
      "bg-[#182135] border-white/10 text-[#F4F6F9] focus:border-[#D4AF37]",
    dividerLine: "bg-white/10",
    dividerText: "text-[#A3ADC2]",
    identityPreviewEditButton: "text-[#D4AF37]",
    navbar: "hidden",
    footer: "hidden",
  },
} as const;
