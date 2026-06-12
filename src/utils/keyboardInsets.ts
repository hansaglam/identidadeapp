import { useEffect, useState } from "react";
import { Keyboard, Platform, type KeyboardEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const KEYBOARD_EXTRA = 12;

/** Klavye yüksekliği (px); kapalıyken 0. */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: KeyboardEvent) => setHeight(e.endCoordinates.height);
    const onHide = () => setHeight(0);

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  return height;
}

export function getKeyboardAvoidingBehavior(): "padding" | "height" {
  return Platform.OS === "ios" ? "padding" : "height";
}

/**
 * ScrollView contentContainerStyle paddingBottom:
 * safe area + sticky footer + klavye.
 * Android `softwareKeyboardLayoutMode: resize` pencereyi küçültür — ekstra klavye
 * padding'i KAV ile çakışıp layout thrash / kilitlenmeye yol açar.
 */
export function useKeyboardScrollPadding(footerHeight = 0, extra = KEYBOARD_EXTRA) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const bottomInset = Math.max(insets.bottom, 8);

  const keyboardPad =
    Platform.OS === "ios" && keyboardHeight > 0 ? keyboardHeight : 0;

  const paddingBottom = bottomInset + footerHeight + extra + keyboardPad;

  return {
    keyboardHeight,
    isKeyboardVisible: keyboardHeight > 0,
    paddingBottom,
    bottomInset,
  };
}

/** Modal / sheet ScrollView — footer yok, sadece klavye + safe area. */
export function useKeyboardModalScrollPadding(extra = KEYBOARD_EXTRA) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const bottomInset = Math.max(insets.bottom, 8);

  // Modal/sheet: klavye açıkken içeriğin tamamı kaydırılabilsin (iOS + Android).
  const keyboardPad = keyboardHeight > 0 ? keyboardHeight : 0;

  return {
    paddingBottom: bottomInset + extra + keyboardPad,
    keyboardHeight,
    isKeyboardVisible: keyboardHeight > 0,
  };
}
