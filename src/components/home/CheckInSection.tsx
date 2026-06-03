import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Spacing, FontSizes } from "../../constants/theme";
import ConfettiAnimation from "../ConfettiAnimation";

interface Props {
  todayDone: boolean;
  checkInAnimating: boolean;
  onCheckInPress: () => void;
  streakDisplay: number;
  streakRoll: { from: number; to: number } | null;
  streakSlide: Animated.Value;
  tickScale: Animated.Value;
  ctaPressScale: Animated.Value;
  showConfetti: boolean;
  onConfettiDone: () => void;
  todayPrimaryText: string | null;
  entranceButton: Animated.Value;
}

export default function CheckInSection({
  todayDone,
  checkInAnimating,
  onCheckInPress,
  streakDisplay,
  streakRoll,
  streakSlide,
  tickScale,
  ctaPressScale,
  showConfetti,
  onConfettiDone,
  todayPrimaryText,
  entranceButton,
}: Props) {
  const iconDonePulse = useRef(new Animated.Value(1)).current;
  const showDoneShell = todayDone && !checkInAnimating;

  useEffect(() => {
    if (!todayDone) {
      iconDonePulse.setValue(1);
      return;
    }
    iconDonePulse.setValue(0.82);
    Animated.spring(iconDonePulse, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [todayDone, iconDonePulse]);

  const streakSlideY = streakSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -26],
  });

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
        {showDoneShell ? "Bugün tamam" : "Günün onayı"}
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
              <ConfettiAnimation trigger={showConfetti} onComplete={onConfettiDone} />

              {showDoneShell ? (
                <LinearGradient
                  colors={["#FCD34D", "#F59E0B"]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.ctaCircle}
                >
                  <Animated.View style={{ transform: [{ scale: iconDonePulse }] }}>
                    <Ionicons name="checkmark-circle" size={48} color="#FFFFFF" />
                  </Animated.View>
                </LinearGradient>
              ) : checkInAnimating ? (
                <TouchableOpacity activeOpacity={1} disabled style={styles.ctaTouchable}>
                  <LinearGradient
                    colors={["#34D399", "#059669"]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.ctaCircle}
                  >
                    <Animated.View style={{ transform: [{ scale: tickScale }] }}>
                      <Ionicons name="checkmark" size={48} color="#FFFFFF" />
                    </Animated.View>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={onCheckInPress}
                  style={styles.ctaTouchable}
                  accessibilityLabel="Günü onayla"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={["#34D399", "#059669"]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.ctaCircle}
                  >
                    <Ionicons name="checkmark" size={56} color="#FFFFFF" />
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
          <Text style={styles.doneCaption}>Bugün tamamlandı</Text>
        ) : streakRoll ? (
          <View style={styles.streakCaptionClip}>
            <Animated.View style={{ transform: [{ translateY: streakSlideY }] }}>
              <Text style={styles.captionStrong}>
                {streakRoll.from} gün üst üste
              </Text>
              <Text style={styles.captionStrong}>
                {streakRoll.to} gün üst üste
              </Text>
            </Animated.View>
          </View>
        ) : streakDisplay > 0 ? (
          <Text style={styles.captionStrong}>
            {streakDisplay} gün üst üste — harika gidiyorsun
          </Text>
        ) : todayPrimaryText ? (
          <Text style={styles.planCaption} numberOfLines={2}>
            Dün planladın: {todayPrimaryText}
          </Text>
        ) : (
          <Text style={styles.captionZero}>Tamamlamak için dokun</Text>
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
