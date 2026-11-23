// Mapa ilustrado del archipiélago y escenas de cada lugar.
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, View, useWindowDimensions } from 'react-native';
import { Text } from '../text';
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect, Line } from 'react-native-svg';
import { ACTIVITIES } from '../../content/activities';
import { CHARACTERS, GUIDE_LINES, PATH_LANTERNS, STORY_PAGES, Zone, ZONES } from '../../content/world';
import type { ActivityId } from '../../domain/types';
import { Avatar, CharacterArt, Icon } from '../art';
import { Btn, GuideBubble, IconBtn, Pic, Row, Screen, Txt, useReduceMotion, useSfx } from '../components';
import { useStore } from '../store';
import { radius } from '../theme';

const O = '#2A3350';
const st = { stroke: O, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

// ---------- Ilustraciones de los lugares (lienzo 120×100) ----------

function BosqueArt() {
  return (
    <G>
      <Ellipse cx={60} cy={90} rx={54} ry={8} fill="#9FD08F" {...st} />
      <Rect x={24} y={60} width={8} height={26} fill="#8A5A3C" {...st} />
      <Polygon points="28,14 8,64 48,64" fill="#3E8E5E" {...st} />
      <Rect x={84} y={62} width={8} height={24} fill="#8A5A3C" {...st} />
      <Circle cx={88} cy={48} r={22} fill="#5DAE6E" {...st} />
      <Rect x={56} y={66} width={7} height={20} fill="#8A5A3C" {...st} />
      <Polygon points="60,34 44,72 76,72" fill="#4E9F6B" {...st} />
      <Path d="M50 22 L50 10 L58 8 L58 20" fill="none" {...st} />
      <Ellipse cx={47} cy={22} rx={4} ry={3} fill={O} />
      <Ellipse cx={55} cy={20} rx={4} ry={3} fill={O} />
      <Path d="M100 20 L100 8" {...st} />
      <Ellipse cx={97} cy={20} rx={4} ry={3} fill={O} />
      <Path d="M100 8 Q106 10 106 16" fill="none" {...st} />
    </G>
  );
}
function IslaArt() {
  return (
    <G>
      <Ellipse cx={60} cy={88} rx={56} ry={10} fill="#7CC3E0" {...st} />
      <Path d="M14 86 Q60 58 106 86 Z" fill="#F2D29B" {...st} />
      <Polygon points="60,16 30,2 90,2" fill="#F7C548" opacity={0.6} />
      <Rect x={52} y={16} width={16} height={10} rx={2} fill="#F7C548" {...st} />
      <Polygon points="49,26 71,26 68,76 52,76" fill="#FFFFFF" {...st} />
      <Polygon points="51,40 69,40 68.5,50 51.5,50" fill="#D9485B" />
      <Polygon points="52,60 68,60 67.6,68 52.4,68" fill="#D9485B" />
      <Path d="M22 70 L22 50 L34 54 L22 58" fill="#5B8FD6" {...st} />
      <Path d="M96 72 L96 50 L108 54 L96 58" fill="#E8574F" {...st} />
    </G>
  );
}
function TallerArt() {
  return (
    <G>
      <Ellipse cx={60} cy={90} rx={52} ry={7} fill="#9FD08F" {...st} />
      <Path d="M80 30 L80 4 L90 4 L90 22" fill="#F7C548" {...st} />
      <Path d="M80 4 L85 -4 L90 4" fill="#F0C9A0" {...st} />
      <Rect x={18} y={44} width={84} height={44} rx={4} fill="#F6E3C4" {...st} />
      <Polygon points="10,46 60,14 110,46" fill="#D9705A" {...st} />
      <Rect x={50} y={60} width={20} height={28} rx={3} fill="#A9744F" {...st} />
      <Rect x={26} y={56} width={18} height={16} rx={2} fill="#7CC3E0" {...st} />
      <Rect x={76} y={56} width={18} height={16} rx={2} fill="#7CC3E0" {...st} />
      <Rect x={40} y={34} width={40} height={14} rx={3} fill="#FFFFFF" {...st} />
      {/* cartel con renglones de escritura y un lápiz chiquito */}
      <Path d="M46 39 L66 39 M46 43 L60 43" fill="none" {...st} strokeWidth={1.8} stroke="#9AA6BD" />
      <Path d="M68 45 L76 37 L78 39 L70 47 L67 48 Z" fill="#F7C548" {...st} strokeWidth={1.4} />
    </G>
  );
}
function BibliotecaArt() {
  return (
    <G>
      <Ellipse cx={60} cy={90} rx={54} ry={7} fill="#9FD08F" {...st} />
      <Rect x={14} y={80} width={92} height={8} fill="#D8DEE8" {...st} />
      <Rect x={20} y={44} width={80} height={36} fill="#F2ECE0" {...st} />
      {[28, 48, 68, 88].map((x) => (
        <Rect key={x} x={x - 4} y={44} width={8} height={36} fill="#FFFFFF" {...st} />
      ))}
      <Polygon points="12,46 60,22 108,46" fill="#5B7FD6" {...st} />
      <Path d="M60 26 Q46 16 34 20 L34 4 Q46 0 60 10 Q74 0 86 4 L86 20 Q74 16 60 26 Z" fill="#FFF7E6" {...st} />
      <Path d="M60 10 L60 26" {...st} />
    </G>
  );
}
function LaboratorioArt() {
  return (
    <G>
      <Ellipse cx={60} cy={90} rx={54} ry={7} fill="#9FD08F" {...st} />
      <Rect x={24} y={50} width={72} height={38} rx={4} fill="#E3DDF2" {...st} />
      <Path d="M24 52 Q24 14 60 14 Q96 14 96 52 Z" fill="#8A63C2" {...st} />
      <Path d="M60 14 L60 52" {...st} stroke="#B9A3E0" strokeWidth={4} />
      <Path d="M66 26 L96 8" {...st} strokeWidth={7} stroke="#5B6478" />
      <Rect x={50} y={64} width={20} height={24} rx={3} fill="#5B6478" {...st} />
      <Circle cx={36} cy={66} r={8} fill="#F7C548" {...st} />
      <Circle cx={36} cy={66} r={3} fill={O} />
      <Circle cx={84} cy={66} r={7} fill="#7CC3E0" {...st} />
    </G>
  );
}

export const PLACE_ART: Record<string, () => React.ReactElement> = {
  'bosque-sonidos': BosqueArt,
  'isla-palabras': IslaArt,
  'taller-escritura': TallerArt,
  'biblioteca-historias': BibliotecaArt,
  laboratorio: LaboratorioArt,
};

export function PlaceArt({ zoneId, width = 120 }: { zoneId: string; width?: number }) {
  const Draw = PLACE_ART[zoneId];
  return (
    <Svg width={width} height={width * (100 / 120)} viewBox="0 -6 120 106">
      {Draw && <Draw />}
    </Svg>
  );
}

// ---------- Mapa ----------

function lanternPoints(w: number, h: number) {
  const pts = ZONES.map((z) => ({ x: z.pos.x * w, y: z.pos.y * h + 34 }));
  const segs: { a: (typeof pts)[0]; b: (typeof pts)[0]; len: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) segs.push({ a: pts[i], b: pts[i + 1], len: Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y) });
  const total = segs.reduce((s, x) => s + x.len, 0);
  return Array.from({ length: PATH_LANTERNS }).map((_, k) => {
    let d = ((k + 0.5) / PATH_LANTERNS) * total;
    for (const sg of segs) {
      if (d <= sg.len) {
        const t = d / sg.len;
        return { x: sg.a.x + (sg.b.x - sg.a.x) * t, y: sg.a.y + (sg.b.y - sg.a.y) * t };
      }
      d -= sg.len;
    }
    return pts[pts.length - 1];
  });
}

function Landmark({ zone, index, locked, w, h, onOpen }: { zone: Zone; index: number; locked: boolean; w: number; h: number; onOpen: () => void }) {
  const { theme } = useStore();
  const reduce = useReduceMotion();
  const sfx = useSfx();
  const pop = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    // entrada escalonada al abrir el mapa (una sola vez)
    Animated.timing(pop, { toValue: 1, duration: 380, delay: 120 * index, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }).start();
  }, [reduce, pop, index]);
  const artW = Math.min(132, w * 0.36);
  const boxW = artW + 20;
  const press = () => {
    sfx('tap');
    if (reduce) return onOpen();
    Animated.sequence([
      Animated.timing(bounce, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(() => onOpen());
  };
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: zone.pos.x * w - boxW / 2,
        top: zone.pos.y * h - artW * 0.5,
        width: boxW,
        alignItems: 'center',
        opacity: pop,
        transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }, { translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }],
      }}
    >
      <Pressable accessibilityRole="button" accessibilityLabel={locked ? `${zone.name}. Se abre jugando ${zone.unlockAtMissions} misiones.` : `${zone.name}. ${zone.mission}`} onPress={press} style={{ alignItems: 'center' }}>
        <View style={{ opacity: locked ? 0.55 : 1 }}>
          <PlaceArt zoneId={zone.id} width={artW} />
        </View>
        <View style={{ backgroundColor: locked ? 'rgba(255,255,255,0.85)' : theme.surface, borderRadius: 14, borderWidth: 2, borderColor: locked ? theme.border : zone.color, borderBottomWidth: 4, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -6 }}>
          {locked && <Icon name="lock" size={14} color={theme.inkSoft} />}
          <Text style={{ fontSize: theme.fs(13), fontWeight: '800', color: theme.ink, textAlign: 'center' }} numberOfLines={2}>
            {zone.name}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function MapScreen() {
  const { current, push, theme } = useStore();
  const { width } = useWindowDimensions();
  const p = current!;
  const w = Math.min(width, 560) - 24;
  const h = w * 1.55;
  const lanterns = useMemo(() => lanternPoints(w, h), [w, h]);
  const lit = Math.min(PATH_LANTERNS, p.missionsCompleted);
  const lastAct = [...p.attempts].reverse().find((a) => a.context !== 'exploracion')?.activityId as ActivityId | undefined;
  const lastZone = ZONES.find((z) => z.id === p.zonesVisited[p.zonesVisited.length - 1]) ?? ZONES[1];
  return (
    <Screen padded={false} right={<IconBtn icon="door" label="Terminar por hoy" compact onPress={() => push({ name: 'goodbye' })} />} title="Mapa del archipiélago">
      <View style={{ paddingHorizontal: 12, gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row gap={8}>
            <Avatar {...p.avatar} size={48} />
            <Txt size={18} weight="800">
              {p.alias}
            </Txt>
          </Row>
          <Row gap={6} style={{ backgroundColor: theme.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderColor: theme.border }} >
            <Pic pic="farol" size={26} />
            <Txt size={15} weight="800">
              {lit}/{PATH_LANTERNS}
            </Txt>
          </Row>
        </Row>
        <GuideBubble size={56} text={p.missionsCompleted === 0 ? GUIDE_LINES.mapHint : `Ya encendiste ${lit} farol${lit === 1 ? '' : 'es'} del camino. ${GUIDE_LINES.mapHint}`} />
        {!p.exploration && <Btn label="Jugar a conocernos con Lumi" icon="play" kind="light" onPress={() => push({ name: 'exploration' })} />}
      </View>
      <View style={{ width: w, height: h, alignSelf: 'center', borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#8EC8E3', borderWidth: 3, borderColor: theme.seaDeep, marginTop: 10 }} accessibilityLabel="Mapa del archipiélago">
        <Svg width={w} height={h} style={{ position: 'absolute' }}>
          {/* mar con olas suaves */}
          {Array.from({ length: 9 }).map((_, i) => (
            <Path key={i} d={`M${(i % 2) * 30} ${h * (0.05 + i * 0.11)} q12 -5 24 0 t24 0`} stroke="#B5DCEE" strokeWidth={2} fill="none" />
          ))}
          {/* tierra */}
          <Path
            d={`M${w * 0.06} ${h * 0.12} Q${w * 0.2} ${h * 0.02} ${w * 0.5} ${h * 0.08} Q${w * 0.95} ${h * 0.12} ${w * 0.94} ${h * 0.42} Q${w * 0.98} ${h * 0.72} ${w * 0.86} ${h * 0.8} Q${w * 0.7} ${h * 0.97} ${w * 0.32} ${h * 0.96} Q${w * 0.04} ${h * 0.94} ${w * 0.06} ${h * 0.7} Q${w * 0.02} ${h * 0.4} ${w * 0.06} ${h * 0.12} Z`}
            fill="#CFE8BF"
            stroke="#E9D7A8"
            strokeWidth={10}
          />
          {/* camino */}
          <Path
            d={ZONES.map((z, i) => `${i ? 'L' : 'M'}${z.pos.x * w} ${z.pos.y * h + 34}`).join(' ')}
            stroke="#F2E2B8"
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d={ZONES.map((z, i) => `${i ? 'L' : 'M'}${z.pos.x * w} ${z.pos.y * h + 34}`).join(' ')}
            stroke="#D9C48F"
            strokeWidth={2}
            strokeDasharray="6 8"
            fill="none"
          />
          {/* faroles del camino: uno por misión jugada */}
          {lanterns.map((pt, i) => (
            <G key={i}>
              {i < lit && <Circle cx={pt.x} cy={pt.y - 8} r={10} fill="#F7D54A" opacity={0.45} />}
              <Line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y - 6} stroke={O} strokeWidth={2} />
              <Rect x={pt.x - 4} y={pt.y - 14} width={8} height={9} rx={2} fill={i < lit ? '#F7C548' : '#C9C2B2'} stroke={O} strokeWidth={1.6} />
            </G>
          ))}
        </Svg>
        {ZONES.map((z, i) => (
          <Landmark key={z.id} zone={z} index={i} locked={p.missionsCompleted < z.unlockAtMissions} w={w} h={h} onOpen={() => push({ name: 'zone', zoneId: z.id })} />
        ))}
        {/* el avatar espera en el último lugar visitado */}
        <View pointerEvents="none" style={{ position: 'absolute', left: lastZone.pos.x * w + 24, top: lastZone.pos.y * h + 6 }}>
          <Avatar {...p.avatar} size={38} />
        </View>
      </View>
      <View style={{ paddingHorizontal: 12, gap: 10, marginTop: 12, marginBottom: 12 }}>
        {lastAct && ACTIVITIES[lastAct] && (
          <Btn label={`Seguir jugando: ${ACTIVITIES[lastAct].kidTitle}`} icon="play" big onPress={() => push({ name: 'mission', activityId: lastAct })} />
        )}
        <Row wrap>
          <Btn label="Mi historia" icon="eye" kind="secondary" onPress={() => push({ name: 'story' })} style={{ flex: 1 }} />
          <Btn label="Mi ropero" icon="pencil" kind="secondary" onPress={() => push({ name: 'wardrobe' })} style={{ flex: 1 }} />
        </Row>
        <Btn label="Terminar por hoy" icon="door" kind="ghost" onPress={() => push({ name: 'goodbye' })} />
      </View>
    </Screen>
  );
}

// ---------- Lugar ----------

export function ZoneScreen({ zoneId }: { zoneId: string }) {
  const { current, push, back, updateCurrent, theme } = useStore();
  const p = current!;
  const z = ZONES.find((x) => x.id === zoneId) ?? ZONES[0];
  const host = CHARACTERS[z.host];
  const locked = p.missionsCompleted < z.unlockAtMissions;
  const sfx = useSfx();
  useEffect(() => {
    if (!locked && !p.zonesVisited.includes(z.id)) updateCurrent((x) => ({ ...x, zonesVisited: [...x.zonesVisited, z.id] }));
    else if (!locked) updateCurrent((x) => ({ ...x, zonesVisited: [...x.zonesVisited.filter((id) => id !== z.id), z.id] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const acts = z.activities.filter((a) => p.skills[a].enabled);
  const left = z.unlockAtMissions - p.missionsCompleted;
  return (
    <Screen title={z.name} onBack={back} bg={theme.bg}>
      <View style={{ backgroundColor: z.color + '22', borderRadius: radius.xl, borderWidth: 2, borderColor: z.color, padding: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
        <PlaceArt zoneId={z.id} width={170} />
        <View style={{ alignItems: 'center' }}>
          <CharacterArt id={z.host} size={92} />
          <Txt size={15} weight="800">
            {host.name}
          </Txt>
        </View>
      </View>
      <GuideBubble
        size={56}
        text={locked ? `Este lugar se abre cuando juegues ${left} misión${left > 1 ? 'es' : ''} más en cualquier lugar.` : z.mission}
      />
      {!locked &&
        acts.map((a: ActivityId) => {
          const d = ACTIVITIES[a];
          return (
            <Pressable
              key={a}
              accessibilityRole="button"
              accessibilityLabel={`Jugar: ${d.kidTitle}`}
              onPress={() => {
                sfx('tap');
                push({ name: 'mission', activityId: a });
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                backgroundColor: theme.surface,
                borderRadius: radius.xl,
                borderWidth: 2,
                borderColor: z.color,
                borderBottomWidth: pressed ? 2 : 6,
                marginTop: pressed ? 4 : 0,
                padding: 12,
              })}
            >
              <View style={{ backgroundColor: z.color + '22', borderRadius: radius.lg, padding: 4 }}>
                <Pic pic={d.icon} size={64} />
              </View>
              <Txt size={19} weight="800" style={{ flex: 1 }}>
                {d.kidTitle}
              </Txt>
              <View style={{ backgroundColor: z.color, borderRadius: 24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="play" size={26} color="#FFFFFF" />
              </View>
            </Pressable>
          );
        })}
      {!locked && acts.length === 0 && <Txt>Un adulto pausó estas misiones por ahora.</Txt>}
      {locked && <Btn label="Volver al mapa" onPress={back} />}
    </Screen>
  );
}

export const LIGHT_LEVEL = (pages: number) => pages / STORY_PAGES.length;
