/**
 * Google Play Billing Product Definitions
 * Corresponds to lib/billing/products.dart in the Flutter spec.
 */

export const AURUM_GOLD_PRODUCT_IDS = {
  MONTHLY: 'aurum_gold_monthly',
  YEARLY: 'aurum_gold_yearly',
  LIFETIME: 'aurum_gold_lifetime',
} as const;

export type AurumProductId = (typeof AURUM_GOLD_PRODUCT_IDS)[keyof typeof AURUM_GOLD_PRODUCT_IDS];

export interface ProductDetails {
  id: AurumProductId;
  title: string;
  description: string;
  price: string;
  rawPrice: number;
  currencyCode: string;
  type: 'subs' | 'inapp'; // subscription or non-consumable one-time purchase
  period?: 'monthly' | 'yearly' | 'lifetime';
  hasFreeTrial?: boolean;
}

export type PurchaseStatus = 'pending' | 'purchased' | 'restored' | 'error' | 'canceled';

export interface PurchaseDetails {
  purchaseId: string;
  productId: AurumProductId;
  status: PurchaseStatus;
  transactionDate: number;
  verificationData: {
    source: 'google_play';
    serverVerificationData: string;
    localVerificationData: string;
  };
  errorMessage?: string;
}

export const MOCK_PLAY_STORE_PRODUCTS: Record<AurumProductId, ProductDetails> = {
  [AURUM_GOLD_PRODUCT_IDS.MONTHLY]: {
    id: AURUM_GOLD_PRODUCT_IDS.MONTHLY,
    title: 'Aurum Gold Monthly',
    description: 'Full access to unlimited habits, analytics, and all languages. Renews monthly.',
    price: '$2.99',
    rawPrice: 2.99,
    currencyCode: 'USD',
    type: 'subs',
    period: 'monthly',
  },
  [AURUM_GOLD_PRODUCT_IDS.YEARLY]: {
    id: AURUM_GOLD_PRODUCT_IDS.YEARLY,
    title: 'Aurum Gold Yearly',
    description: '7-day free trial, then $19.99/year. Best value.',
    price: '$19.99',
    rawPrice: 19.99,
    currencyCode: 'USD',
    type: 'subs',
    period: 'yearly',
    hasFreeTrial: true,
  },
  [AURUM_GOLD_PRODUCT_IDS.LIFETIME]: {
    id: AURUM_GOLD_PRODUCT_IDS.LIFETIME,
    title: 'Aurum Gold Lifetime',
    description: 'Permanent non-consumable unlock. No recurring fees.',
    price: '$35.00',
    rawPrice: 35.0,
    currencyCode: 'USD',
    type: 'inapp',
    period: 'lifetime',
  },
};
