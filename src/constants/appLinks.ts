import { Platform } from "react-native";

/**
 * Mağaza / uygulama içi hukuki linkler.
 * GitHub Pages (legal/ workflow): hansaglam/identidadeapp
 * Özel domain alındığında LEGAL_HOST'u güncelle (ör. https://rito.app).
 */
const LEGAL_HOST = "https://hansaglam.github.io/identidadeapp";

export const PRIVACY_POLICY_URL = `${LEGAL_HOST}/privacy.html`;

export const TERMS_URL = `${LEGAL_HOST}/terms.html`;

/** Destek e-postası — mağaza listesi ve PRIVACY/TERMS ile aynı olmalı */
export const SUPPORT_EMAIL = "ethemsincarbusiness@gmail.com";

export function getManageSubscriptionsUrl(): string {
  if (Platform.OS === "ios") {
    return "https://apps.apple.com/account/subscriptions";
  }
  return "https://play.google.com/store/account/subscriptions";
}
