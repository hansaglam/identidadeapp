/**
 * Simple confetti burst using React Native Animated.
 * Spawns N particles from center, scatters outward, fades out.
 * Usage: <ConfettiAnimation trigger={shouldPlay} onComplete={...} />
 */
import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const COLORS = ["#1D9E75", "#D85A30", "#534AB7", "#D4A017", "#4CC9F0", "#FF6B9D"];
const PARTICLE_COUNT = 24;

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
  targetX: number;
  targetY: number;
  size: number;
  shape: "circle" | "rect";
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * 2 * Math.PI + Math.random() * 0.5;
    const distance = 80 + Math.random() * 140;
    return {
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      color: COLORS[i % COLORS.length],
      targetX: Math.cos(angle) * distance,
      targetY: Math.sin(angle) * distance - 60,
      size: 6 + Math.random() * 6,
      shape: Math.random() > 0.5 ? "circle" : "rect",
    };
  });
}

interface Props {
  trigger: boolean;
  onComplete?: () => void;
}

export default function ConfettiAnimation({ trigger, onComplete }: Props) {
  const particles = useRef<Particle[]>(createParticles()).current;

  useEffect(() => {
    if (!trigger) return;

    // Reset
    particles.forEach((p) => {
      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(0);
      p.scale.setValue(0);
    });

    const animations = particles.map((p, i) => {
      const delay = i * 15;
      return Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.spring(p.x, {
            toValue: p.targetX,
            useNativeDriver: true,
            speed: 6,
            bounciness: 4,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.spring(p.y, {
            toValue: p.targetY,
            useNativeDriver: true,
            speed: 6,
            bounciness: 4,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(p.opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(300),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.spring(p.scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 12,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      onComplete?.();
    });
  }, [trigger]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              borderRadius: p.shape === "circle" ? p.size / 2 : 2,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  particle: {
    position: "absolute",
  },
});
