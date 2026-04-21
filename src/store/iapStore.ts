/**
 * In-App Purchase store (Google Play Billing via react-native-iap).
 *
 * Product IDs must be registered in Google Play Console before use.
 * This is a ready-to-fill skeleton — wire in real product IDs when ready.
 *
 * Docs: https://github.com/dooboolab-community/react-native-iap
 */
import { create } from "zustand";
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getAvailablePurchases,
} from "react-native-iap";

// ─── Product IDs ───────────────────────────────────────────────────────────
// Register these in the Google Play Console → In-app products / Subscriptions
export const IAP_PRODUCTS = {
  PRO_LIFETIME: "discipline_66day_lifetime",
} as const;

export type IAPProductId = (typeof IAP_PRODUCTS)[keyof typeof IAP_PRODUCTS];

// ─── Store ─────────────────────────────────────────────────────────────────

interface IAPState {
  isConnected: boolean;
  isPro: boolean;
  products: any[];
  isLoading: boolean;
  error: string | null;

  connect: () => Promise<void>;
  disconnect: () => void;
  loadProducts: () => Promise<void>;
  purchase: (productId: IAPProductId) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

export const useIAPStore = create<IAPState>((set) => {
  let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
  let purchaseErrorSub: ReturnType<typeof purchaseErrorListener> | null = null;

  return {
    isConnected: false,
    isPro: false,
    products: [],
    isLoading: false,
    error: null,

    connect: async () => {
      try {
        await initConnection();
        set({ isConnected: true });

        purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
          // Acknowledge the purchase so Google Play doesn't refund it
          await finishTransaction({ purchase, isConsumable: false });
          set({ isPro: true });
        });

        purchaseErrorSub = purchaseErrorListener((error) => {
          // Ignore user-cancelled
          if (String(error.code) !== "E_USER_CANCELLED") {
            set({ error: error.message ?? "Purchase error" });
          }
        });
      } catch (e: any) {
        set({ error: e?.message ?? "IAP connection failed" });
      }
    },

    disconnect: () => {
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
      endConnection();
      set({ isConnected: false });
    },

    loadProducts: async () => {
      set({ isLoading: true, error: null });
      try {
        const products = await fetchProducts({
          skus: Object.values(IAP_PRODUCTS),
        });
        set({ products: products ?? [], isLoading: false });
      } catch (e: any) {
        set({
          error: e?.message ?? "Failed to load products",
          isLoading: false,
        });
      }
    },

    purchase: async (productId) => {
      set({ isLoading: true, error: null });
      try {
        await requestPurchase({
          type: "in-app",
          request: { google: { skus: [productId] } },
        });
        // Completion handled via purchaseUpdatedListener
      } catch (e: any) {
        if (String(e?.code) !== "E_USER_CANCELLED") {
          set({ error: e?.message ?? "Purchase failed" });
        }
      } finally {
        set({ isLoading: false });
      }
    },

    restorePurchases: async () => {
      set({ isLoading: true, error: null });
      try {
        const purchases = await getAvailablePurchases();
        const hasActive = purchases.some((p) =>
          Object.values(IAP_PRODUCTS).includes(p.productId as IAPProductId)
        );
        set({ isPro: hasActive, isLoading: false });
      } catch (e: any) {
        set({
          error: e?.message ?? "Restore failed",
          isLoading: false,
        });
      }
    },
  };
});
