export type BillingInterval = "one_time";

export interface ProductDocument {
  name: string;
  description: string;
}

export interface ProductTier {
  slug: string;
  name: string;
  price: number;
  currency: "USD";
  lemonsqueezyVariantId: string;
  mostPopular?: boolean;
  tagline: string;
  documents: ProductDocument[];
  features: string[];
  fileKey: string;
}

export interface Product {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  tiers: ProductTier[];
}

export type OrderStatus = "pending" | "paid" | "refunded" | "failed";

export interface Order {
  id: string;
  lemonsqueezyOrderId: string;
  customerEmail: string;
  customerName: string | null;
  productSlug: string;
  tierSlug: string;
  amountTotal: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
}

export interface DownloadTokenPayload {
  orderId: string;
  tierSlug: string;
  fileKey: string;
  email: string;
  expiresAt: number;
}
