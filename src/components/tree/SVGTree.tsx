import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  day: number;
}

export default function SVGTree({ day }: Props) {
  const phase = Math.min(Math.floor((day - 1) / 11), 5);
  const anims = useRef([...Array(6)].map(() => new Animated.Value(phase === 0 ? 1 : 0))).current;
  
  useEffect(() => {
    anims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === phase ? 1 : 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });
  }, [phase]);

  // Yaprak path'i - gerçek yaprak şekli
  const leafPath = "M 0,0 C -8,-12 -6,-22 0,-28 C 6,-22 8,-12 0,0";
  
  const trunkColor = "#92400E";
  const leafLight = "#34D399";
  const leafMain = "#10B981";
  const leafDark = "#059669";
  const fruitColor = "#EF4444";

  const renderPhase = (index: number, opacity: Animated.Value) => {
    const commonStyle = { opacity };
    
    switch (index) {
      case 0: // Gün 1-11: Filiz
        return (
          <Animated.View key={0} style={[StyleSheet.absoluteFill, commonStyle, { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 42 }]}>
            <Svg width={200} height={160} viewBox="0 0 200 160">
              {/* Sap */}
              <Path d="M 100,160 Q 98,145 100,130" stroke={trunkColor} strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Yaprak sol */}
              <Path d="M 100,130 Q 85,118 78,108" stroke={leafMain} strokeWidth="2" fill="none" />
              <Path d={leafPath} fill={leafMain} transform="translate(78,108) rotate(-45) scale(0.7)" />
              {/* Yaprak sağ */}
              <Path d="M 100,130 Q 115,120 122,112" stroke={leafMain} strokeWidth="2" fill="none" />
              <Path d={leafPath} fill={leafDark} transform="translate(122,112) rotate(45) scale(0.6)" />
              {/* Yaprak orta */}
              <Path d={leafPath} fill={leafLight} transform="translate(100,125) rotate(0) scale(0.5)" />
            </Svg>
          </Animated.View>
        );
      
      case 1: // Gün 12-22: Fidan
        return (
          <Animated.View key={1} style={[StyleSheet.absoluteFill, commonStyle, { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 38 }]}>
            <Svg width={220} height={190} viewBox="0 0 220 190">
              {/* Ana sap */}
              <Path d="M 110,190 Q 107,165 110,140" stroke={trunkColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
              {/* Dal sol */}
              <Path d="M 110,160 Q 92,148 82,138" stroke={trunkColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Dal sağ */}
              <Path d="M 110,155 Q 128,145 138,135" stroke={trunkColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Yapraklar */}
              <Path d={leafPath} fill={leafMain} transform="translate(82,138) rotate(-50) scale(0.9)" />
              <Path d={leafPath} fill={leafDark} transform="translate(138,135) rotate(45) scale(0.85)" />
              <Path d={leafPath} fill={leafLight} transform="translate(110,140) rotate(-10) scale(0.7)" />
              <Path d={leafPath} fill={leafMain} transform="translate(95,150) rotate(-30) scale(0.6)" />
              <Path d={leafPath} fill={leafDark} transform="translate(125,148) rotate(25) scale(0.65)" />
            </Svg>
          </Animated.View>
        );

      case 2: // Gün 23-33: Genç Ağaç
        return (
          <Animated.View key={2} style={[StyleSheet.absoluteFill, commonStyle, { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 35 }]}>
            <Svg width={240} height={220} viewBox="0 0 240 220">
              {/* Gövde */}
              <Path d="M 120,220 Q 116,185 120,150" stroke={trunkColor} strokeWidth="7" fill="none" strokeLinecap="round" />
              {/* Dal sol */}
              <Path d="M 120,175 Q 95,158 78,142" stroke={trunkColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Dal sağ */}
              <Path d="M 120,170 Q 145,153 162,137" stroke={trunkColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Alt dal sol */}
              <Path d="M 120,195 Q 102,182 92,170" stroke={trunkColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Alt dal sağ */}
              <Path d="M 120,190 Q 138,178 148,166" stroke={trunkColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Yapraklar */}
              <Path d={leafPath} fill={leafMain} transform="translate(78,142) rotate(-55) scale(1.1)" />
              <Path d={leafPath} fill={leafDark} transform="translate(162,137) rotate(50) scale(1.05)" />
              <Path d={leafPath} fill={leafLight} transform="translate(120,148) rotate(0) scale(0.9)" />
              <Path d={leafPath} fill={leafMain} transform="translate(92,170) rotate(-35) scale(0.8)" />
              <Path d={leafPath} fill={leafDark} transform="translate(148,166) rotate(30) scale(0.85)" />
              <Path d={leafPath} fill={leafMain} transform="translate(105,158) rotate(-20) scale(0.75)" />
              <Path d={leafPath} fill={leafDark} transform="translate(135,155) rotate(15) scale(0.7)" />
            </Svg>
          </Animated.View>
        );

      case 3: // Gün 34-44: Büyüyen Ağaç
        return (
          <Animated.View key={3} style={[StyleSheet.absoluteFill, commonStyle, { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 32 }]}>
            <Svg width={260} height={250} viewBox="0 0 260 250">
              {/* Gövde */}
              <Path d="M 130,250 Q 125,205 130,165" stroke={trunkColor} strokeWidth="10" fill="none" strokeLinecap="round" />
              {/* Ana dal sol */}
              <Path d="M 130,195 Q 98,172 72,148" stroke={trunkColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
              {/* Ana dal sağ */}
              <Path d="M 130,188 Q 162,165 188,141" stroke={trunkColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
              {/* Orta dal sol */}
              <Path d="M 130,215 Q 108,198 95,182" stroke={trunkColor} strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Orta dal sağ */}
              <Path d="M 130,210 Q 152,193 165,177" stroke={trunkColor} strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Üst dal sol */}
              <Path d="M 130,175 Q 115,162 108,148" stroke={trunkColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Üst dal sağ */}
              <Path d="M 130,170 Q 145,157 152,143" stroke={trunkColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Yapraklar - bolca */}
              <Path d={leafPath} fill={leafMain} transform="translate(72,148) rotate(-60) scale(1.3)" />
              <Path d={leafPath} fill={leafDark} transform="translate(188,141) rotate(55) scale(1.25)" />
              <Path d={leafPath} fill={leafLight} transform="translate(130,158) rotate(0) scale(1.1)" />
              <Path d={leafPath} fill={leafMain} transform="translate(95,182) rotate(-40) scale(1)" />
              <Path d={leafPath} fill={leafDark} transform="translate(165,177) rotate(35) scale(1.05)" />
              <Path d={leafPath} fill={leafMain} transform="translate(108,148) rotate(-25) scale(0.9)" />
              <Path d={leafPath} fill={leafDark} transform="translate(152,143) rotate(20) scale(0.95)" />
              <Path d={leafPath} fill={leafLight} transform="translate(85,165) rotate(-45) scale(0.85)" />
              <Path d={leafPath} fill={leafMain} transform="translate(175,160) rotate(40) scale(0.9)" />
              <Path d={leafPath} fill={leafDark} transform="translate(118,138) rotate(-10) scale(0.8)" />
              <Path d={leafPath} fill={leafMain} transform="translate(142,135) rotate(10) scale(0.85)" />
            </Svg>
          </Animated.View>
        );

      case 4: // Gün 45-55: Olgun Ağaç
        return (
          <Animated.View key={4} style={[StyleSheet.absoluteFill, commonStyle, { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 30 }]}>
            <Svg width={280} height={280} viewBox="0 0 280 280">
              {/* Kalın gövde */}
              <Path d="M 140,280 Q 134,230 140,185" stroke={trunkColor} strokeWidth="13" fill="none" strokeLinecap="round" />
              {/* Dal sol */}
              <Path d="M 140,220 Q 100,192 68,162" stroke={trunkColor} strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* Dal sağ */}
              <Path d="M 140,212 Q 180,184 212,154" stroke={trunkColor} strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* Alt dal */}
              <Path d="M 140,245 Q 114,224 98,204" stroke={trunkColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <Path d="M 140,238 Q 166,217 182,197" stroke={trunkColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Orta dal */}
              <Path d="M 140,198 Q 122,182 112,164" stroke={trunkColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <Path d="M 140,192 Q 158,176 168,158" stroke={trunkColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Yapraklar */}
              <Path d={leafPath} fill={leafMain} transform="translate(68,162) rotate(-65) scale(1.5)" />
              <Path d={leafPath} fill={leafDark} transform="translate(212,154) rotate(60) scale(1.45)" />
              <Path d={leafPath} fill={leafLight} transform="translate(140,175) rotate(0) scale(1.3)" />
              <Path d={leafPath} fill={leafMain} transform="translate(98,204) rotate(-45) scale(1.2)" />
              <Path d={leafPath} fill={leafDark} transform="translate(182,197) rotate(40) scale(1.25)" />
              <Path d={leafPath} fill={leafMain} transform="translate(112,164) rotate(-30) scale(1.1)" />
              <Path d={leafPath} fill={leafDark} transform="translate(168,158) rotate(25) scale(1.15)" />
              <Path d={leafPath} fill={leafLight} transform="translate(82,185) rotate(-50) scale(1.05)" />
              <Path d={leafPath} fill={leafMain} transform="translate(198,178) rotate(45) scale(1.1)" />
              <Path d={leafPath} fill={leafDark} transform="translate(125,150) rotate(-15) scale(1)" />
              <Path d={leafPath} fill={leafMain} transform="translate(155,146) rotate(15) scale(1.05)" />
              <Path d={leafPath} fill={leafLight} transform="translate(140,155) rotate(0) scale(0.95)" />
              <Path d={leafPath} fill={leafMain} transform="translate(105,175) rotate(-35) scale(0.9)" />
              <Path d={leafPath} fill={leafDark} transform="translate(175,170) rotate(30) scale(0.95)" />
            </Svg>
          </Animated.View>
        );

      case 5: // Gün 56-66: Altın Ağaç
        return (
          <Animated.View key={5} style={[StyleSheet.absoluteFill, commonStyle, { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 28 }]}>
            <Svg width={300} height={300} viewBox="0 0 300 300">
              {/* Gövde */}
              <Path d="M 150,300 Q 143,245 150,195" stroke={trunkColor} strokeWidth="15" fill="none" strokeLinecap="round" />
              {/* Dallar */}
              <Path d="M 150,235 Q 105,202 68,168" stroke={trunkColor} strokeWidth="5.5" fill="none" strokeLinecap="round" />
              <Path d="M 150,226 Q 195,193 232,159" stroke={trunkColor} strokeWidth="5.5" fill="none" strokeLinecap="round" />
              <Path d="M 150,262 Q 120,238 102,214" stroke={trunkColor} strokeWidth="4" fill="none" strokeLinecap="round" />
              <Path d="M 150,254 Q 180,230 198,206" stroke={trunkColor} strokeWidth="4" fill="none" strokeLinecap="round" />
              <Path d="M 150,208 Q 128,188 116,168" stroke={trunkColor} strokeWidth="3" fill="none" strokeLinecap="round" />
              <Path d="M 150,200 Q 172,180 184,160" stroke={trunkColor} strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Altın yapraklar */}
              <Path d={leafPath} fill="#FBBF24" transform="translate(68,168) rotate(-70) scale(1.6)" />
              <Path d={leafPath} fill="#F59E0B" transform="translate(232,159) rotate(65) scale(1.55)" />
              <Path d={leafPath} fill="#FCD34D" transform="translate(150,185) rotate(0) scale(1.4)" />
              <Path d={leafPath} fill="#FBBF24" transform="translate(102,214) rotate(-50) scale(1.3)" />
              <Path d={leafPath} fill="#F59E0B" transform="translate(198,206) rotate(45) scale(1.35)" />
              <Path d={leafPath} fill="#FCD34D" transform="translate(116,168) rotate(-35) scale(1.2)" />
              <Path d={leafPath} fill="#FBBF24" transform="translate(184,160) rotate(30) scale(1.25)" />
              <Path d={leafPath} fill="#F59E0B" transform="translate(85,195) rotate(-55) scale(1.15)" />
              <Path d={leafPath} fill="#FCD34D" transform="translate(215,188) rotate(50) scale(1.2)" />
              <Path d={leafPath} fill="#FBBF24" transform="translate(135,162) rotate(-20) scale(1.1)" />
              <Path d={leafPath} fill="#F59E0B" transform="translate(165,158) rotate(20) scale(1.15)" />
              <Path d={leafPath} fill="#FCD34D" transform="translate(150,170) rotate(0) scale(1.05)" />
              <Path d={leafPath} fill="#FBBF24" transform="translate(112,188) rotate(-40) scale(1)" />
              <Path d={leafPath} fill="#F59E0B" transform="translate(188,182) rotate(35) scale(1.05)" />
              <Path d={leafPath} fill="#FCD34D" transform="translate(125,178) rotate(-15) scale(0.95)" />
              <Path d={leafPath} fill="#FBBF24" transform="translate(175,174) rotate(15) scale(1)" />
              {/* Meyveler */}
              <Circle cx="88" cy="190" r="5.5" fill={fruitColor} />
              <Circle cx="212" cy="182" r="5.5" fill={fruitColor} />
              <Circle cx="120" cy="200" r="5" fill={fruitColor} />
              <Circle cx="180" cy="194" r="5" fill={fruitColor} />
              <Circle cx="150" cy="210" r="6" fill={fruitColor} />
              <Circle cx="72" cy="178" r="4.5" fill={fruitColor} />
              <Circle cx="228" cy="170" r="4.5" fill={fruitColor} />
              <Circle cx="138" cy="148" r="4" fill={fruitColor} />
              <Circle cx="162" cy="144" r="4" fill={fruitColor} />
              <Circle cx="150" cy="155" r="4.5" fill={fruitColor} />
            </Svg>
          </Animated.View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E0F2FE', '#F0FDF4']} style={styles.gradient}>
        {/* Bulutlar - daha yumuşak, dağınık */}
        <View style={[styles.cloud, { top: 20, left: 20, width: 65, height: 24, opacity: 0.5 }]} />
        <View style={[styles.cloud, { top: 45, right: 30, width: 50, height: 20, opacity: 0.4 }]} />
        <View style={[styles.cloud, { top: 15, left: '42%', width: 55, height: 22, opacity: 0.45 }]} />
        <View style={[styles.cloud, { top: 60, left: '15%', width: 40, height: 16, opacity: 0.35 }]} />

        {/* Gölge - ağacın dibine */}
        <View style={styles.shadow} />

        {/* Ağaç SVG'leri - üst üste, sadece aktif phase görünür */}
        <View style={styles.treeContainer}>
          {anims.map((anim, index) => renderPhase(index, anim))}
        </View>

        {/* Organik Toprak - Gradient */}
        <View style={styles.groundContainer}>
          <Svg width="100%" height={50} viewBox="0 0 400 50" preserveAspectRatio="none">
            <Defs>
              <SvgGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#92400E" />
                <Stop offset="100%" stopColor="#78350F" />
              </SvgGradient>
            </Defs>
            <Path d="M 0,20 Q 50,10 100,18 T 200,15 T 300,19 T 400,16 L 400,50 L 0,50 Z" fill="url(#groundGrad)" />
          </Svg>
        </View>

        {/* Çimler */}
        <View style={styles.grassContainer}>
          <View style={[styles.grass, { left: '18%', bottom: 42 }]} />
          <View style={[styles.grass, { left: '25%', bottom: 44, height: 10 }]} />
          <View style={[styles.grass, { left: '72%', bottom: 42 }]} />
          <View style={[styles.grass, { left: '80%', bottom: 45, height: 11 }]} />
          <View style={[styles.grass, { left: '45%', bottom: 43, height: 9 }]} />
          <View style={[styles.grass, { left: '55%', bottom: 44, height: 10 }]} />
        </View>
      </LinearGradient>

      <View style={styles.textArea}>
        <Text style={styles.dayText}>Gün {day}</Text>
        <Text style={styles.phaseTitle}>
          {day <= 22 ? 'Kuruluş Fazı' : day <= 44 ? 'Pekiştirme Fazı' : 'Otomatikleşme Fazı'}
        </Text>
        <Text style={styles.phaseSub}>
          {day <= 22 ? 'Çapa yerine oturuyor' : day <= 44 ? 'Otomatikleşme başlıyor' : 'Kimlik inşası tamamlanıyor'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  gradient: {
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cloud: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  shadow: {
    position: 'absolute',
    bottom: 48,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 50,
  },
  treeContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    transform: [{ scale: 1.6 }],
    top: 20,
  },
  groundContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 1,
  },
  grassContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 3,
  },
  grass: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#34D399',
  },
  textArea: {
    alignItems: 'center',
    marginTop: 14,
  },
  dayText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  phaseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
    marginTop: 6,
  },
  phaseSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});