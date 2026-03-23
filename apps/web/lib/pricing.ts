/**
 * Pricing configuration for frontend
 * This mirrors the backend configuration
 */

export interface PricingFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  currency: string;
  features: PricingFeature[];
  popular?: boolean;
  cta: string;
  monthlyPriceId: string;
  yearlyPriceId?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for trying out TaskFlow",
    monthlyPrice: 0,
    currency: "USD",
    monthlyPriceId:
      process.env.NEXT_PUBLIC_POLAR_STARTER_MONTHLY_PRICE_ID || "",
    features: [
      { text: "Basic AI Rules & Guidelines", included: true },
      { text: "1 Project", included: true },
      { text: "Community Support", included: true },
      { text: "Basic Templates", included: true },
      { text: "Email Support", included: false },
      { text: "Priority Updates", included: false },
      { text: "Custom AI Rules", included: false },
      { text: "Team Collaboration", included: false },
    ],
    cta: "Get Started Free",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious developers building with AI",
    monthlyPrice: 29,
    yearlyPrice: 290,
    currency: "USD",
    monthlyPriceId: process.env.NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRICE_ID || "",
    yearlyPriceId: process.env.NEXT_PUBLIC_POLAR_PRO_YEARLY_PRICE_ID || "",
    features: [
      { text: "All Starter Features", included: true },
      { text: "Unlimited Projects", included: true },
      { text: "Advanced AI Rules Library", included: true },
      { text: "Custom AI Rules Generator", included: true },
      { text: "Priority Email Support", included: true },
      { text: "Early Access to New Features", included: true },
      { text: "Code Snippet Library", included: true },
      { text: "Team Collaboration", included: false },
    ],
    popular: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "team",
    name: "Team",
    description: "For teams building together",
    monthlyPrice: 99,
    yearlyPrice: 990,
    currency: "USD",
    monthlyPriceId: process.env.NEXT_PUBLIC_POLAR_TEAM_MONTHLY_PRICE_ID || "",
    yearlyPriceId: process.env.NEXT_PUBLIC_POLAR_TEAM_YEARLY_PRICE_ID || "",
    features: [
      { text: "All Pro Features", included: true },
      { text: "Up to 10 Team Members", included: true },
      { text: "Shared AI Rules & Templates", included: true },
      { text: "Team Analytics Dashboard", included: true },
      { text: "Priority Support + Slack Channel", included: true },
      { text: "Custom Integrations", included: true },
      { text: "Advanced Security Features", included: true },
      { text: "Dedicated Account Manager", included: true },
    ],
    cta: "Contact Sales",
  },
];

export function getPricingTier(tierId: string): PricingTier | undefined {
  return PRICING_TIERS.find((tier) => tier.id === tierId);
}

export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}
