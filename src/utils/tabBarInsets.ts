import { Platform } from "react-native";
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/** 3-button nav: runtime inset bazen 0; minimum güvenli alan (dp). */
const ANDROID_NAV_FALLBACK_DP = 48;

/** Scroll içeriği ile tab bar arası ek boşluk. */
export const TAB_BAR_SCROLL_EXTRA = 12;

/** İkon + etiket alanı (alt inset hariç). */
export const TAB_BAR_CONTENT_HEIGHT = Platform.OS === "android" ? 56 : 49;

/**
 * Alt sistem çubuğu / home indicator inset'i.
 * Runtime + initialWindowMetrics birleşimi; Android'de 0 ise fallback.
 */
export function getTabBarBottomInset(insets: { bottom: number }): number {
  const runtime = insets.bottom;
  const initial = initialWindowMetrics?.insets.bottom ?? 0;
  const resolved = Math.max(runtime, initial);

  if (Platform.OS === "ios") {
    return Math.max(resolved, 8);
  }
  if (resolved > 0) {
    return resolved;
  }
  return ANDROID_NAV_FALLBACK_DP;
}

export type TabBarMetrics = {
  bottomInset: number;
  contentHeight: number;
  totalHeight: number;
  /** ScrollView / FlatList contentContainerStyle paddingBottom */
  scrollPadding: number;
};

/** Tab bar + scroll padding — tüm ana sekmelerde tek kaynak. */
export function useTabBarMetrics(): TabBarMetrics {
  const insets = useSafeAreaInsets();
  const bottomInset = getTabBarBottomInset(insets);
  const contentHeight = TAB_BAR_CONTENT_HEIGHT;
  const totalHeight = contentHeight + bottomInset;
  return {
    bottomInset,
    contentHeight,
    totalHeight,
    scrollPadding: totalHeight + TAB_BAR_SCROLL_EXTRA,
  };
}
