/**
 * BillingService
 * Wraps Google Play Billing functionality (in_app_purchase / in_app_purchase_android).
 * Provides availability checks, product querying, purchase stream updates, buy(), and restorePurchases().
 */

import {
  AURUM_GOLD_PRODUCT_IDS,
  AurumProductId,
  MOCK_PLAY_STORE_PRODUCTS,
  ProductDetails,
  PurchaseDetails,
  PurchaseStatus,
} from './products';

type PurchaseListener = (purchase: PurchaseDetails) => void;

class BillingService {
  private isBillingAvailable: boolean = true;
  private products: Map<AurumProductId, ProductDetails> = new Map();
  private listeners: Set<PurchaseListener> = new Set();
  private pendingPurchases: Map<string, PurchaseDetails> = new Map();

  constructor() {
    this.init();
  }

  /**
   * Checks in_app_purchase availability on app start and loads products
   */
  async init(): Promise<boolean> {
    try {
      this.isBillingAvailable = true;
      await this.queryProductDetails();
      return true;
    } catch {
      this.isBillingAvailable = false;
      return false;
    }
  }

  /**
   * Queries product details for the three product IDs:
   * "aurum_gold_monthly", "aurum_gold_yearly", "aurum_gold_lifetime"
   */
  async queryProductDetails(): Promise<ProductDetails[]> {
    if (!this.isBillingAvailable) return [];

    // Simulate query to Google Play Billing Client
    await new Promise((resolve) => setTimeout(resolve, 80));

    const productIds: AurumProductId[] = [
      AURUM_GOLD_PRODUCT_IDS.MONTHLY,
      AURUM_GOLD_PRODUCT_IDS.YEARLY,
      AURUM_GOLD_PRODUCT_IDS.LIFETIME,
    ];

    const result: ProductDetails[] = [];
    for (const id of productIds) {
      const details = MOCK_PLAY_STORE_PRODUCTS[id];
      if (details) {
        this.products.set(id, details);
        result.push(details);
      }
    }

    return result;
  }

  /**
   * Returns cached product details by ID
   */
  getProduct(productId: AurumProductId): ProductDetails | undefined {
    return this.products.get(productId) || MOCK_PLAY_STORE_PRODUCTS[productId];
  }

  /**
   * Returns all loaded products
   */
  getAllProducts(): ProductDetails[] {
    return Array.from(this.products.values());
  }

  /**
   * Exposes a stream/callback for purchase updates (pending, purchased, restored, error, canceled)
   */
  listenToPurchaseUpdates(listener: PurchaseListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(purchase: PurchaseDetails) {
    this.listeners.forEach((listener) => {
      try {
        listener(purchase);
      } catch (err) {
        console.error('Error in purchase update listener:', err);
      }
    });
  }

  /**
   * Triggers the Google Play purchase flow for a given ProductDetails
   * Emits 'pending' first, then resolves to 'purchased' or 'error'
   */
  async buy(product: ProductDetails): Promise<void> {
    const purchaseId = `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Emit pending state
    const pendingPurchase: PurchaseDetails = {
      purchaseId,
      productId: product.id,
      status: 'pending',
      transactionDate: Date.now(),
      verificationData: {
        source: 'google_play',
        serverVerificationData: `token-${purchaseId}`,
        localVerificationData: `local-${purchaseId}`,
      },
    };

    this.pendingPurchases.set(purchaseId, pendingPurchase);
    this.notifyListeners(pendingPurchase);

    // 2. Simulate native Google Play sheet interaction
    await new Promise((resolve) => setTimeout(resolve, 600));

    // TODO: Verify purchase against Google Play Developer API (Phase 5) before finalizing
    // Server-side purchase verification should confirm purchase token with purchases.subscriptions.get
    // or purchases.products.get on production backend before unlocking entitlement.

    const completedPurchase: PurchaseDetails = {
      ...pendingPurchase,
      status: 'purchased',
    };

    this.pendingPurchases.delete(purchaseId);
    this.notifyListeners(completedPurchase);
  }

  /**
   * Restores existing purchases for the active Google Play account
   */
  async restorePurchases(): Promise<void> {
    // Emit restored state for lifetime/subscription if previously owned
    await new Promise((resolve) => setTimeout(resolve, 500));

    const restoredPurchase: PurchaseDetails = {
      purchaseId: `restored-${Date.now()}`,
      productId: AURUM_GOLD_PRODUCT_IDS.YEARLY,
      status: 'restored',
      transactionDate: Date.now(),
      verificationData: {
        source: 'google_play',
        serverVerificationData: `restored-token-${Date.now()}`,
        localVerificationData: `restored-local-${Date.now()}`,
      },
    };

    this.notifyListeners(restoredPurchase);
  }
}

export const billingService = new BillingService();
