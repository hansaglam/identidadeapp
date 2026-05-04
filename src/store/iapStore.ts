/**
 * In-App Purchase store (Google Play / App Store via react-native-iap).
 *
 * Aylık abonelik SKU'su mağazada tanımlı olmalı (Play Console / App Store Connect).
 * Satın alma onayı asynchronous geldiği için kullanıcı profilinde premium,
 * buradaki dinleyicide `setPremium` ile güncellenir (modal senkron if ile yetinmez).
 */
import { Platform } from "react-native";
import { create } from "zustand";
import type { Purchase, ProductSubscription } from "react-native-iap";
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
import { useUserStore } from "./userStore";

// ─── Product IDs ───────────────────────────────────────────────────────────
/** Play Console / App Store Connect'te "Abonelik" olarak oluştur. */
export const IAP_PRODUCTS = {
  PRO_MONTHLY: "discipline_pro_monthly",
} as const;

export type IAPProductId = (typeof IAP_PRODUCTS)[keyof typeof IAP_PRODUCTS];

function isOurSku(productId?: string): productId is IAPProductId {
  return (
    productId != null &&
    (Object.values(IAP_PRODUCTS) as string[]).includes(productId)
  );
}

async function persistPremiumAfterPurchase(purchase: Purchase): Promise<void> {
  const pid = purchase.productId;
  if (!isOurSku(pid)) return;
  const token =
    (purchase as Purchase & { purchaseToken?: string }).purchaseToken ??
    purchase.id ??
    pid;
  const profile = useUserStore.getState().profile;
  if (!profile) return;
  await useUserStore.getState().setPremium(true, String(token ?? "iap"));
}

function subscriptionPurchaseArgs(
  sku: string,
  catalog: unknown[],
): Parameters<typeof requestPurchase>[0] {
  const sub = catalog.find(
    (p): p is ProductSubscription =>
      typeof p === "object" &&
      p !== null &&
      "id" in p &&
      (p as ProductSubscription).id === sku &&
      (p as ProductSubscription).type === "subs"
  );

  if (Platform.OS === "ios") {
    return {
      type: "subs",
      request: { apple: { sku } },
    };
  }

  if (sub?.platform === "android") {
    const std = sub.subscriptionOffers?.[0];
    const token =
      std?.offerTokenAndroid ??
      sub.subscriptionOfferDetailsAndroid?.[0]?.offerToken ??
      null;
    if (token) {
      return {
        type: "subs",
        request: {
          google: {
            skus: [sku],
            subscriptionOffers: [{ sku, offerToken: token }],
          },
        },
      };
    }
  }

  return {
    type: "subs",
    request: { google: { skus: [sku] } },
  };
}

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

export const useIAPStore = create<IAPState>((set, get) => {
  let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener> | null =
    null;
  let purchaseErrorSub: ReturnType<typeof purchaseErrorListener> | null = null;

  const tearDownListeners = () => {
    purchaseUpdateSub?.remove();
    purchaseErrorSub?.remove();
    purchaseUpdateSub = null;
    purchaseErrorSub = null;
  };

  return {
    isConnected: false,
    isPro: false,
    products: [],
    isLoading: false,
    error: null,

    connect: async () => {
      tearDownListeners();
      try {
        if (!get().isConnected) {
          await initConnection();
        }

        purchaseUpdateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
          await finishTransaction({ purchase, isConsumable: false });
          set({ isPro: true });
          await persistPremiumAfterPurchase(purchase);
        });

        purchaseErrorSub = purchaseErrorListener((error) => {
          if (String(error.code) !== "E_USER_CANCELLED") {
            set({ error: error.message ?? "Purchase error" });
          }
        });

        set({ isConnected: true, error: null });
      } catch (e: any) {
        set({ error: e?.message ?? "IAP connection failed" });
      }
    },

    disconnect: () => {
      tearDownListeners();
      try {
        endConnection();
      } catch {
        /* no-op */
      }
      set({ isConnected: false });
    },

    loadProducts: async () => {
      set({ isLoading: true, error: null });
      try {
        const products = await fetchProducts({
          skus: Object.values(IAP_PRODUCTS),
          type: "subs",
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
        const args = subscriptionPurchaseArgs(productId, get().products);
        await requestPurchase(args);
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
        const ours = purchases.find((p) => isOurSku(p.productId));
        const hasActive = ours != null;
        set({ isPro: hasActive, isLoading: false });
        if (hasActive && ours) await persistPremiumAfterPurchase(ours);
      } catch (e: any) {
        set({
          error: e?.message ?? "Restore failed",
          isLoading: false,
        });
      }
    },
  };
});
