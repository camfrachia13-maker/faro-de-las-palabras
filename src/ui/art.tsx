// Ilustraciones originales en SVG: Lumi (guía), Tito, Mara, Bruno, avatares, íconos y el faro.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect, Polygon, Line } from 'react-native-svg';
import { AVATAR_COLORS } from '../content/world';

export type Mood = 'feliz' | 'pensando' | 'celebra' | 'escucha';

export function Lumi({ size = 120, mood = 'feliz', animate = true }: { size?: number; mood?: Mood; animate?: boolean }) {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, bob]);
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.05] });
  const mouth =
    mood === 'celebra' ? 'M42 62 Q50 72 58 62 Z' : mood === 'pensando' ? 'M44 64 Q50 62 56 64' : mood === 'escucha' ? 'M46 63 Q50 66 54 63' : 'M43 61 Q50 69 57 61';
  return (
    <Animated.View style={{ transform: [{ translateY }] }} accessible accessibilityLabel="Lumi, la luciérnaga guía" accessibilityRole="image">
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* halo de luz */}
        <Circle cx={50} cy={78} r={20} fill="#F2B544" opacity={0.25} />
        {/* alas */}
        <Ellipse cx={30} cy={40} rx={16} ry={11} fill="#D9ECF7" stroke="#2D5D8A" strokeWidth={2} transform="rotate(-25 30 40)" />
        <Ellipse cx={70} cy={40} rx={16} ry={11} fill="#D9ECF7" stroke="#2D5D8A" strokeWidth={2} transform="rotate(25 70 40)" />
        {/* cola-farol */}
        <Ellipse cx={50} cy={78} rx={13} ry={12} fill="#F2B544" stroke="#7A4E00" strokeWidth={2} />
        <Ellipse cx={46} cy={74} rx={4} ry={3} fill="#FFF4CC" />
        {/* cuerpo */}
        <Circle cx={50} cy={52} r={22} fill="#2D5D8A" />
        {/* antenas */}
        <Path d="M42 32 Q36 18 30 16" stroke="#1B3A5C" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M58 32 Q64 18 70 16" stroke="#1B3A5C" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Circle cx={30} cy={16} r={4} fill="#F2B544" />
        <Circle cx={70} cy={16} r={4} fill="#F2B544" />
        {/* cara */}
        <Circle cx={50} cy={53} r={16} fill="#FFE9C2" />
        {mood === 'pensando' ? (
          <>
            <Path d="M41 50 Q44 47 47 50" stroke="#1F2A44" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <Path d="M53 50 Q56 47 59 50" stroke="#1F2A44" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <Circle cx={44} cy={50} r={3.2} fill="#1F2A44" />
            <Circle cx={56} cy={50} r={3.2} fill="#1F2A44" />
            <Circle cx={45} cy={49} r={1} fill="#fff" />
            <Circle cx={57} cy={49} r={1} fill="#fff" />
          </>
        )}
        <Circle cx={39} cy={57} r={2.6} fill="#F4A3A3" opacity={0.7} />
        <Circle cx={61} cy={57} r={2.6} fill="#F4A3A3" opacity={0.7} />
        <Path d={mouth} stroke="#1F2A44" strokeWidth={2.2} fill={mood === 'celebra' ? '#C85A3F' : 'none'} strokeLinecap="round" />
        {mood === 'celebra' && (
          <G>
            <Path d="M14 22 l3 6 6 1 -5 4 1 6 -5 -3 -5 3 1 -6 -5 -4 6 -1z" fill="#F2B544" />
            <Path d="M84 58 l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1z" fill="#F2B544" />
          </G>
        )}
      </Svg>
    </Animated.View>
  );
}

export function Tito({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="Tito, la tortuga cartera">
      <Ellipse cx={50} cy={86} rx={34} ry={5} fill="#1F2A44" opacity={0.1} />
      <Ellipse cx={28} cy={80} rx={8} ry={6} fill="#7CC4A0" />
      <Ellipse cx={70} cy={80} rx={8} ry={6} fill="#7CC4A0" />
      <Path d="M18 72 Q20 36 50 34 Q80 36 82 72 Z" fill="#3E9C7A" stroke="#1F5E47" strokeWidth={2.5} />
      <Path d="M34 46 L50 40 L66 46 L62 62 L38 62 Z" fill="#5DB592" stroke="#1F5E47" strokeWidth={2} />
      <Circle cx={84} cy={56} r={13} fill="#7CC4A0" stroke="#1F5E47" strokeWidth={2} />
      <Circle cx={88} cy={53} r={2.5} fill="#1F2A44" />
      <Path d="M84 61 Q88 64 92 60" stroke="#1F2A44" strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* gorra de cartero */}
      <Path d="M72 47 Q84 36 96 46 Z" fill="#2D5D8A" />
      <Rect x={70} y={45} width={28} height={4} rx={2} fill="#1B3A5C" />
      {/* bolso con carta */}
      <Rect x={36} y={60} width={22} height={14} rx={3} fill="#E8B46A" stroke="#7A4E00" strokeWidth={2} />
      <Path d="M36 61 L47 69 L58 61" stroke="#7A4E00" strokeWidth={2} fill="none" />
    </Svg>
  );
}

export function Mara({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="Mara, la gaviota de los cuentos">
      <Ellipse cx={50} cy={90} rx={26} ry={4} fill="#1F2A44" opacity={0.1} />
      <Ellipse cx={50} cy={60} rx={26} ry={24} fill="#FFFFFF" stroke="#5B7FD6" strokeWidth={2.5} />
      <Path d="M28 58 Q14 50 18 70 Q30 74 36 66 Z" fill="#B9C9EE" stroke="#5B7FD6" strokeWidth={2} />
      <Path d="M72 58 Q86 50 82 70 Q70 74 64 66 Z" fill="#B9C9EE" stroke="#5B7FD6" strokeWidth={2} />
      <Circle cx={50} cy={34} r={16} fill="#FFFFFF" stroke="#5B7FD6" strokeWidth={2.5} />
      <Circle cx={44} cy={32} r={2.8} fill="#1F2A44" />
      <Circle cx={56} cy={32} r={2.8} fill="#1F2A44" />
      <Polygon points="46,38 54,38 50,46" fill="#F2B544" stroke="#7A4E00" strokeWidth={1.5} />
      <Path d="M44 84 L42 92 M56 84 L58 92" stroke="#F2B544" strokeWidth={3} strokeLinecap="round" />
      {/* libro */}
      <Path d="M38 62 L50 66 L62 62 L62 76 L50 80 L38 76 Z" fill="#F6EBD6" stroke="#5B7FD6" strokeWidth={2} />
      <Line x1={50} y1={66} x2={50} y2={80} stroke="#5B7FD6" strokeWidth={2} />
    </Svg>
  );
}

export function Bruno({ size = 80 }: { size?: number }) {
  const arm = (d: string, k: number) => <Path key={k} d={d} stroke="#D9705A" strokeWidth={7} fill="none" strokeLinecap="round" />;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="Bruno, el pulpo que arregla el faro">
      {[
        'M30 62 Q14 72 18 88',
        'M38 66 Q30 82 36 92',
        'M50 68 Q50 84 46 94',
        'M62 66 Q70 82 64 92',
        'M70 62 Q86 72 82 88',
      ].map(arm)}
      <Ellipse cx={50} cy={44} rx={28} ry={26} fill="#E9866F" stroke="#A4442F" strokeWidth={2.5} />
      <Circle cx={40} cy={44} r={7} fill="#fff" />
      <Circle cx={60} cy={44} r={7} fill="#fff" />
      <Circle cx={41} cy={45} r={3.2} fill="#1F2A44" />
      <Circle cx={61} cy={45} r={3.2} fill="#1F2A44" />
      <Path d="M42 56 Q50 62 58 56" stroke="#1F2A44" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {/* llave inglesa */}
      <Path d="M78 30 L90 18" stroke="#4A5672" strokeWidth={4} strokeLinecap="round" />
      <Circle cx={91} cy={17} r={5} fill="none" stroke="#4A5672" strokeWidth={3} />
      <Circle cx={36} cy={28} r={3} fill="#F4B6A6" />
      <Circle cx={58} cy={24} r={2.5} fill="#F4B6A6" />
    </Svg>
  );
}

export function CharacterArt({ id, size }: { id: 'lumi' | 'tito' | 'mara' | 'bruno'; size?: number }) {
  if (id === 'tito') return <Tito size={size} />;
  if (id === 'mara') return <Mara size={size} />;
  if (id === 'bruno') return <Bruno size={size} />;
  return <Lumi size={size} animate={false} />;
}

export function Lighthouse({ size = 90, lit = 0 }: { size?: number; lit?: number }) {
  // lit: 0..1 intensidad de la luz (avance de la historia)
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="El faro">
      <Polygon points="50,14 20,0 80,0" fill="#F2B544" opacity={0.15 + lit * 0.6} />
      <Rect x={40} y={14} width={20} height={12} rx={2} fill={lit > 0 ? '#F2B544' : '#C9C2B2'} stroke="#1F2A44" strokeWidth={2} />
      <Polygon points="36,26 64,26 60,90 40,90" fill="#FFFFFF" stroke="#1F2A44" strokeWidth={2} />
      <Polygon points="38,44 62,44 61,56 39,56" fill="#C85A3F" />
      <Polygon points="40,70 60,70 59.5,80 40.5,80" fill="#C85A3F" />
      <Rect x={32} y={88} width={36} height={8} rx={2} fill="#4A5672" />
      <Path d="M44 14 Q50 6 56 14" fill="#1F2A44" />
    </Svg>
  );
}

// ---------- Avatares ----------

export function Avatar({ base, color, accessory, size = 72 }: { base: number; color: number; accessory?: string | null; size?: number }) {
  const c = AVATAR_COLORS[color % AVATAR_COLORS.length].hex;
  const ears = [
    null,
    <Polygon key="e" points="22,30 34,8 44,28" fill={c} stroke="#1F2A44" strokeWidth={2} />, // zorro
    <Polygon key="e" points="24,30 30,10 42,26" fill={c} stroke="#1F2A44" strokeWidth={2} />, // gata
    <Circle key="e" cx={34} cy={22} r={9} fill={c} stroke="#1F2A44" strokeWidth={2} />, // rana
    <Line key="e" x1={50} y1={20} x2={50} y2={6} stroke="#1F2A44" strokeWidth={3} />, // robot
    <Polygon key="e" points="26,28 30,12 40,24" fill={c} stroke="#1F2A44" strokeWidth={2} />, // búho
  ][base % 6];
  const earsR = [
    null,
    <Polygon key="r" points="56,28 66,8 78,30" fill={c} stroke="#1F2A44" strokeWidth={2} />,
    <Polygon key="r" points="58,26 70,10 76,30" fill={c} stroke="#1F2A44" strokeWidth={2} />,
    <Circle key="r" cx={66} cy={22} r={9} fill={c} stroke="#1F2A44" strokeWidth={2} />,
    <Circle key="r" cx={50} cy={6} r={4} fill="#F2B544" stroke="#1F2A44" strokeWidth={2} />,
    <Polygon key="r" points="60,24 70,12 74,28" fill={c} stroke="#1F2A44" strokeWidth={2} />,
  ][base % 6];
  const isRobot = base % 6 === 4;
  const isPenguin = base % 6 === 0;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {ears}
      {earsR}
      {isRobot ? (
        <Rect x={18} y={20} width={64} height={60} rx={14} fill={c} stroke="#1F2A44" strokeWidth={2.5} />
      ) : (
        <Circle cx={50} cy={52} r={32} fill={c} stroke="#1F2A44" strokeWidth={2.5} />
      )}
      <Ellipse cx={50} cy={58} rx={isPenguin ? 22 : 20} ry={isPenguin ? 22 : 17} fill="#FFF3E0" />
      <Circle cx={40} cy={48} r={base % 6 === 5 ? 8 : 4} fill={base % 6 === 5 ? '#fff' : '#1F2A44'} stroke="#1F2A44" strokeWidth={base % 6 === 5 ? 2 : 0} />
      <Circle cx={60} cy={48} r={base % 6 === 5 ? 8 : 4} fill={base % 6 === 5 ? '#fff' : '#1F2A44'} stroke="#1F2A44" strokeWidth={base % 6 === 5 ? 2 : 0} />
      {base % 6 === 5 && (
        <>
          <Circle cx={40} cy={48} r={3.5} fill="#1F2A44" />
          <Circle cx={60} cy={48} r={3.5} fill="#1F2A44" />
        </>
      )}
      {isPenguin || base % 6 === 5 ? (
        <Polygon points="45,56 55,56 50,63" fill="#F2B544" stroke="#7A4E00" strokeWidth={1.5} />
      ) : (
        <Path d="M42 62 Q50 69 58 62" stroke="#1F2A44" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      )}
      <AccessoryArt id={accessory ?? null} />
    </Svg>
  );
}

function AccessoryArt({ id }: { id: string | null }) {
  switch (id) {
    case 'gorro':
      return (
        <G>
          <Path d="M26 28 Q50 4 74 28 Z" fill="#FFFFFF" stroke="#1F2A44" strokeWidth={2} />
          <Rect x={22} y={26} width={56} height={7} rx={3} fill="#2D5D8A" />
        </G>
      );
    case 'bufanda':
      return (
        <G>
          <Rect x={26} y={78} width={48} height={10} rx={5} fill="#C85A3F" stroke="#1F2A44" strokeWidth={2} />
          <Rect x={58} y={82} width={10} height={16} rx={3} fill="#C85A3F" stroke="#1F2A44" strokeWidth={2} />
        </G>
      );
    case 'anteojos':
      return (
        <G>
          <Circle cx={40} cy={48} r={9} fill="none" stroke="#1F2A44" strokeWidth={3} />
          <Circle cx={60} cy={48} r={9} fill="none" stroke="#1F2A44" strokeWidth={3} />
          <Line x1={49} y1={48} x2={51} y2={48} stroke="#1F2A44" strokeWidth={3} />
        </G>
      );
    case 'corona':
      return <Polygon points="30,26 36,12 44,22 50,8 56,22 64,12 70,26" fill="#F2B544" stroke="#7A4E00" strokeWidth={2} />;
    case 'farol':
      return (
        <G>
          <Line x1={84} y1={60} x2={84} y2={70} stroke="#1F2A44" strokeWidth={2} />
          <Rect x={78} y={70} width={12} height={16} rx={3} fill="#F2B544" stroke="#7A4E00" strokeWidth={2} />
        </G>
      );
    case 'flor':
      return (
        <G>
          {[0, 72, 144, 216, 288].map((a) => (
            <Circle key={a} cx={24 + 6 * Math.cos((a * Math.PI) / 180)} cy={30 + 6 * Math.sin((a * Math.PI) / 180)} r={5} fill="#F4A3C0" />
          ))}
          <Circle cx={24} cy={30} r={4} fill="#F2B544" />
        </G>
      );
    default:
      return null;
  }
}

// ---------- Íconos ----------

export type IconName = 'speaker' | 'hint' | 'back' | 'home' | 'check' | 'lock' | 'gear' | 'trash' | 'mic' | 'stop' | 'play' | 'undo' | 'eye' | 'shell' | 'door' | 'pencil' | 'skip' | 'close';

export function Icon({ name, size = 26, color = '#1F2A44' }: { name: IconName; size?: number; color?: string }) {
  const p = { stroke: color, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const body = (() => {
    switch (name) {
      case 'speaker':
        return (
          <>
            <Path d="M4 10 h4 l5 -4 v12 l-5 -4 h-4 z" {...p} fill={color} />
            <Path d="M16 9 q2 3 0 6 M18.5 6.5 q4 5.5 0 11" {...p} />
          </>
        );
      case 'hint':
        return (
          <>
            <Path d="M9 18 h6 M10 21 h4 M12 3 a6 6 0 0 1 4 10.5 c-1 1 -1 2 -1 3 h-6 c0 -1 0 -2 -1 -3 A6 6 0 0 1 12 3z" {...p} />
          </>
        );
      case 'back':
        return <Path d="M15 5 l-7 7 7 7" {...p} strokeWidth={2.8} />;
      case 'home':
        return <Path d="M4 11 l8 -7 8 7 v9 h-5 v-6 h-6 v6 h-5 z" {...p} />;
      case 'check':
        return <Path d="M5 12.5 l4.5 4.5 9.5 -10" {...p} strokeWidth={3} />;
      case 'lock':
        return (
          <>
            <Rect x={5} y={11} width={14} height={10} rx={2} {...p} />
            <Path d="M8 11 V8 a4 4 0 0 1 8 0 v3" {...p} />
          </>
        );
      case 'gear':
        return (
          <>
            <Circle cx={12} cy={12} r={3.2} {...p} />
            <Path d="M12 2.5 v3 M12 18.5 v3 M2.5 12 h3 M18.5 12 h3 M5.3 5.3 l2.1 2.1 M16.6 16.6 l2.1 2.1 M5.3 18.7 l2.1 -2.1 M16.6 7.4 l2.1 -2.1" {...p} />
          </>
        );
      case 'trash':
        return <Path d="M4 7 h16 M9 7 V4 h6 v3 M6 7 l1 13 h10 l1 -13 M10 11 v6 M14 11 v6" {...p} />;
      case 'mic':
        return (
          <>
            <Rect x={9} y={3} width={6} height={11} rx={3} {...p} />
            <Path d="M5 11 a7 7 0 0 0 14 0 M12 18 v3" {...p} />
          </>
        );
      case 'stop':
        return <Rect x={6} y={6} width={12} height={12} rx={2} fill={color} />;
      case 'play':
        return <Path d="M8 5 l11 7 -11 7 z" fill={color} />;
      case 'undo':
        return <Path d="M9 14 l-5 -5 5 -5 M4 9 h10 a6 6 0 0 1 0 12 h-3" {...p} />;
      case 'eye':
        return (
          <>
            <Path d="M2 12 q10 -10 20 0 q-10 10 -20 0 z" {...p} />
            <Circle cx={12} cy={12} r={3} {...p} />
          </>
        );
      case 'shell':
        return <Path d="M12 20 L4 9 a9 9 0 0 1 16 0 z M12 20 L8 6 M12 20 V4.5 M12 20 l4 -14" {...p} />;
      case 'door':
        return (
          <>
            <Path d="M14 20 H6 V4 h8 M14 12 h7 M18 9 l3 3 -3 3" {...p} />
          </>
        );
      case 'pencil':
        return <Path d="M4 20 l1 -5 11 -11 4 4 -11 11 z M14 6 l4 4" {...p} />;
      case 'skip':
        return <Path d="M5 5 l8 7 -8 7 z M15 5 v14" {...p} />;
      case 'close':
        return <Path d="M6 6 l12 12 M18 6 l-12 12" {...p} strokeWidth={2.8} />;
    }
  })();
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {body}
      </Svg>
    </View>
  );
}

// Figuras para "La regla de Bruno": forma + color + nombre escrito (no depende solo del color).
const COLOR_HEX: Record<string, string> = { rojo: '#C9504A', azul: '#3A6BC4', amarillo: '#E8B024' };
export function ShapeGlyph({ shape, color, star, size = 64 }: { shape: string; color: string; star?: boolean; size?: number }) {
  const fill = COLOR_HEX[color] ?? '#999';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {shape === 'círculo' && <Circle cx={50} cy={50} r={34} fill={fill} stroke="#1F2A44" strokeWidth={4} />}
      {shape === 'triángulo' && <Polygon points="50,12 88,84 12,84" fill={fill} stroke="#1F2A44" strokeWidth={4} />}
      {shape === 'cuadrado' && <Rect x={16} y={16} width={68} height={68} rx={6} fill={fill} stroke="#1F2A44" strokeWidth={4} />}
      {star && <Path d="M80 4 l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2z" fill="#F2B544" stroke="#7A4E00" strokeWidth={2} />}
    </Svg>
  );
}
