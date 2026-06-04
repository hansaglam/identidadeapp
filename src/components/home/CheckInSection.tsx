import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Spacing, FontSizes } from "../../constants/theme";
import { useTranslation } from "react-i18next";

interface Props {
  todayDone: boolean;
  checkInAnimating: boolean;
  onCheckInPress: () => void;
  streakDisplay: number;
  streakRoll: { from: number; to: number } | null;
  streakSlide: Animated.Value;
  tickScale: Animated.Value;
  ctaPressScale: Animated.Value;
  todayPrimaryText: string | null;
  entranceButton: Animated.Value;
}

const CTA_ICON_SIZE = 52;

export default function CheckInSection({
  todayDone,
  checkInAnimating,
  onCheckInPress,
  streakDisplay,
  streakRoll,
  streakSlide,
  tickScale,
  ctaPressScale,
  todayPrimaryText,
  entranceButton,
}: Props) {
  const { t } = useTranslation();
  const iconDonePulse = useRef(new Animated.Value(1)).current;
  const showDoneShell = todayDone && !checkInAnimating;

  useEffect(() => {
    if (!showDoneShell) {
      iconDonePulse.setValue(1);
      return;
    }
    iconDonePulse.setValue(0.9);
    Animated.timing(iconDonePulse, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [showDoneShell, iconDonePulse]);

  const streakSlideY = streakSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -26],
  });

  const checkIconScale = checkInAnimating
    ? tickScale
    : iconDonePulse;

  const buttonEnterStyle = {
    opacity: entranceButton,
    transform: [
      {
        translateY: entranceButton.interpolate({
          inputRange: [0, 1],
          outputRange: [25, 0],
        }),
      },
      {
        scale: entranceButton.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  return (
    <View style={styles.actionBlock}>
      <Text style={styles.sectionLabel}>
        {showDoneShell ? t("home.checkIn.sectionDone") : t("home.checkIn.sectionPending")}
      </Text>
      <Animated.View style={buttonEnterStyle}>
        <Animated.View style={{ transform: [{ scale: ctaPressScale }] }}>
          <View
            style={[
              styles.ctaGlowShell,
              showDoneShell ? styles.ctaGlowDone : styles.ctaGlowActive,
            ]}
          >
            <View style={styles.ctaWrap}>
              {showDoneShell ? (
                <LinearGradient
                  colors={["#FCD34D", "#F59E0B"]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.ctaCircle}
                >
                  <Animated.View style={{ transform: [{ scale: checkIconScale }] }}>
                    <Ionicons name="checkmark-circle" size={CTA_ICON_SIZE} color="#FFFFFF" />
                  </Animated.View>
                </LinearGradient>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={onCheckInPress}
                  disabled={checkInAnimating}
                  style={styles.ctaTouchable}
                  accessibilityLabel={t("home.checkIn.accessibility")}
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={["#34D399", "#059669"]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.ctaCircle}
                  >
                    <Animated.View style={{ transform: [{ scale: checkIconScale }] }}>
                      <Ionicons name="checkmark" size={CTA_ICON_SIZE} color="#FFFFFF" />
                    </Animated.View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.captionEnter,
          {
            opacity: entranceButton,
            transform: [
              {
                translateY: entranceButton.interpolate({
                  inputRange: [0, 1],
                  outputRange: [25, 0],
                }),
              },
            ],
          },
        ]}
      >
        {showDoneShell ? (
          <Text style={styles.doneCaption}>{t("home.checkIn.doneCaption")}</Text>
        ) : streakRoll ? (
          <View style={styles.streakCaptionClip}>
            <Animated.View style={{ transform: [{ translateY: streakSlideY }] }}>
              <Text style={styles.captionStrong}>
                {t("home.checkIn.streakConsecutive", { count: streakRoll.from })}
              </Text>
              <Text style={styles.captionStrong}>
                {t("home.checkIn.streakConsecutive", { count: streakRoll.to })}
              </Text>
            </Animated.View>
          </View>
        ) : streakDisplay > 0 ? (
          <Text style={styles.captionStrong}>
            {t("home.checkIn.streakGreat", { count: streakDisplay })}
          </Text>
        ) : todayPrimaryText ? (
          <Text style={styles.planCaption} numberOfLines={2}>
            {t("home.checkIn.plannedYesterday", { text: todayPrimaryText })}
          </Text>
        ) : (
          <Text style={styles.captionZero}>{t("home.checkIn.tapToComplete")}</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBlock: {
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  ctaGlowShell: {
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaGlowActive: {
    shadowColor: Colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  ctaGlowDone: {
    shadowColor: "#FBBF24",
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  ctaWrap: {
    position: "relative",
    width: 132,
    height: 132,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTouchable: {
    borderRadius: 80,
    overflow: "hidden",
  },
  ctaCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: "center",
    justifyContent: "center",
  },
  captionEnter: {
    marginTop: 12,
    alignItems: "center",
    minHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  captionStrong: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  captionZero: {
    fontSize: FontSizes.sm,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 20,
  },
  planCaption: {
    marginTop: 4,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_500Medium",
    color: Colors.primaryDark,
    textAlign: "center",
    lineHeight: 20,
  },
  doneCaption: {
    marginTop: 4,
    fontSize: FontSizes.sm,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primaryDark,
    lineHeight: 20,
  },
  streakCaptionClip: {
    marginTop: 4,
    height: 22,
    overflow: "hidden",
    alignItems: "center",
  },
});
