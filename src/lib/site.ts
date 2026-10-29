export const site = {
  name: "InvestMentor",
  company: "Validacore",
  description: "Learn. Analyze. Invest smarter. PSX education, fundamental analysis, and risk-aware learning for Pakistani investors.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || ""
};

export function whatsappUrl() {
  return site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Assalam-o-Alaikum. I'd like to learn more about PSX investing with InvestMentor.")}` : null;
}
