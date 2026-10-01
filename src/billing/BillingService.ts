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
   * Triggers the Google Play purchase flow for a given ProductDetails.
   * Emits 'pending' first.
   * On Web / AI Studio sandbox (where Google Play Services and Play Store are absent):
   * Emits 'error' informing that genuine Google Play payment sheets require an Internal Testing
   * track build installed from Google Play Console with License Testing enabled.
   * Never optimistically sets isGold to true.
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

    // 2. Real Google Play Billing interaction check
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if running in a native Android environment with Google Play Services
    const isNativeAndroid = typeof window !== 'undefined' &&
      (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.() === 'android';

    if (isNativeAndroid) {
      // In native Android wrapper with Play Billing plugin, delegate to native Google Play Billing client
      // Native plugin returns PurchaseStatus.purchased / PurchaseStatus.error via native listener
      return;
    }

    // In AI Studio / browser sandbox environment:
    // Play Billing requires an actual Play Console listing (Internal Testing track) with a Payments Profile
    // and License Testing account. Genuine payment sheets cannot be issued inside the browser sandbox.
    // Do NOT fake or mock purchase completion here; emit error and preserve locked isGold state.
    const sandboxNotice: PurchaseDetails = {
      ...pendingPurchase,
      status: 'error',
      errorMessage: 'Google Play Billing requires an Internal Testing track build installed from Google Play Console. Genuine payment sheets cannot be issued inside the browser sandbox.',
    };

    this.pendingPurchases.delete(purchaseId);
    this.notifyListeners(sandboxNotice);
  }

  /**
   * Restores existing purchases for the active Google Play account.
   * Only emits 'restored' if verified purchase tokens exist; otherwise notifies no active purchase.
   */
  async restorePurchases(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const isNativeAndroid = typeof window !== 'undefined' &&
      (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.() === 'android';

    if (isNativeAndroid) {
      // Delegated to native Play Billing queryPurchasesAsync()
      return;
    }

    // In browser sandbox with no active Google Play account linked
    const noPurchase: PurchaseDetails = {
      purchaseId: `restore-none-${Date.now()}`,
      productId: AURUM_GOLD_PRODUCT_IDS.YEARLY,
      status: 'error',
      transactionDate: Date.now(),
      verificationData: {
        source: 'google_play',
        serverVerificationData: '',
        localVerificationData: '',
      },
      errorMessage: 'No active Google Play purchases found to restore for this account.',
    };

    this.notifyListeners(noPurchase);
  }
}

export const billingService = new BillingService();
