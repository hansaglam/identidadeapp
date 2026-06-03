import { Platform } from "react-native";

/** Mağaza listesi / Play Console’da yayınladığın gizlilik sayfası URL’si. */
export const PRIVACY_POLICY_URL =
  "https://github.com/hansaglam/identidadeapp/blob/main/PRIVACY.md";

/** Abonelik ve kullanım koşulları (aynı repo veya ayrı sayfa). */
export const TERMS_URL =
  "https://github.com/hansaglam/identidadeapp/blob/main/TERMS.md";

export function getManageSubscriptionsUrl(): string {
  if (Platform.OS === "ios") {
    return "https://apps.apple.com/account/subscriptions";
  }
  return "https://play.google.com/store/account/subscriptions";
}
