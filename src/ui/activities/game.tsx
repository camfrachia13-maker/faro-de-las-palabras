// Mecánicas de juego reutilizables: fichas que reaccionan, arrastrar y soltar
// (siempre con alternativa de toque) y demostraciones breves.
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, HostInstance, PanResponder, Pressable, View, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Btn, Row, ScrollLockCtx, Txt, useReduceMotion, useSfx } from '../components';
import { useStore } from '../store';
import { radius } from '../theme';
import { Lumi } from '../art';
import { Illustration } from '../illustrations';

// ---------- Ficha que responde ----------

export type TileState = 'idle' | 'tried' | 'correct' | 'selected';

/**
 * Ficha tocable. Reacciona según el resultado: salto breve si es correcta,
 * sacudida suave si no lo es. Sin animación con "reducir movimiento".
 */
export function GameTile({ state = 'idle', onPress, disabled, label, style, children }: {
  state?: TileState;
  onPress?: () => void;
  disabled?: boolean;
  label: string;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  const { theme } = useStore();
  const reduce = useReduceMotion();
  const shake = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    if (state === 'tried') {
      shake.setValue(0);
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 90, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0.6, duration: 80, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 70, useNativeDriver: true }),
      ]).start();
    }
    if (state === 'correct') {
      hop.setValue(0);
      Animated.sequence([
        Animated.timing(hop, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(hop, { toValue: 0, duration: 320, easing: Easing.bounce, useNativeDriver: true }),
      ]).start();
    }
  }, [state, reduce, shake, hop]);
  const border = state === 'correct' ? theme.ok : state === 'selected' ? theme.seaDeep : theme.border;
  return (
    <Animated.View
      style={[
        {
          transform: [
            { translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) },
            { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
            { scale: hop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
          ],
        },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label + (state === 'tried' ? ', ya probada' : '') + (state === 'correct' ? ', correcta' : '')}
        accessibilityState={{ disabled, selected: state === 'selected' }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => ({
          flex: 1,
          backgroundColor: state === 'correct' ? theme.okBg : theme.surface,
          borderRadius: radius.lg,
          borderWidth: state === 'idle' ? 2 : 4,
          borderBottomWidth: state === 'idle' ? (pressed ? 2 : 6) : 4,
          borderColor: border,
          borderStyle: state === 'tried' ? 'dashed' : 'solid',
          opacity: state === 'tried' ? 0.55 : 1,
          marginTop: pressed && state === 'idle' ? 4 : 0,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
        })}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ---------- Arrastrar y soltar ----------

interface Zone {
  id: string;
  ref: React.RefObject<HostInstance | null>;
}
interface DnD {
  register: (id: string, ref: React.RefObject<HostInstance | null>) => void;
  unregister: (id: string) => void;
  find: (x: number, y: number) => Promise<string | null>;
  hover: string | null;
  setHover: (id: string | null) => void;
}
const DnDCtx = createContext<DnD | null>(null);


export function DragArea({ children }: { children: React.ReactNode }) {
  const zones = useRef<Zone[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const api = useMemo<DnD>(
    () => ({
      register: (id, ref) => {
        zones.current = [...zones.current.filter((z) => z.id !== id), { id, ref }];
      },
      unregister: (id) => {
        zones.current = zones.current.filter((z) => z.id !== id);
      },
      find: async (x, y) => {
        for (const z of zones.current) {
          const r = await new Promise<{ x: number; y: number; w: number; h: number } | null>((res) => {
            if (!z.ref.current) return res(null);
            z.ref.current.measureInWindow((zx: number, zy: number, w: number, h: number) => res({ x: zx, y: zy, w, h }));
          });
          // margen generoso para dedos pequeños
          if (r && x >= r.x - 14 && x <= r.x + r.w + 14 && y >= r.y - 14 && y <= r.y + r.h + 14) return z.id;
        }
        return null;
      },
      hover,
      setHover,
    }),
    [hover],
  );
  return <DnDCtx.Provider value={api}>{children}</DnDCtx.Provider>;
}

export function DropZone({ id, children, style }: { id: string; children: React.ReactNode; style?: ViewStyle }) {
  const dnd = useContext(DnDCtx);
  const ref = useRef<HostInstance>(null);
  useEffect(() => {
    dnd?.register(id, ref);
    return () => dnd?.unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}

/**
 * Pieza que se puede arrastrar hasta una DropZone o tocar (alternativa sin arrastre).
 * onDrop devuelve true si la pieza encajó; si no, vuelve a su lugar.
 */
export function Draggable({ onDrop, onTap, disabled, label, children, style }: {
  onDrop: (zoneId: string) => boolean;
  onTap: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const dnd = useContext(DnDCtx);
  const lockScroll = useContext(ScrollLockCtx);
  const pan = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);
  const cb = useRef({ onDrop, onTap, disabled });
  cb.current = { onDrop, onTap, disabled };
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !cb.current.disabled,
        onMoveShouldSetPanResponder: (_e, g) => !cb.current.disabled && (Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4),
        onMoveShouldSetPanResponderCapture: (_e, g) => !cb.current.disabled && (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          lockScroll(true);
          setDragging(true);
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: async (_e, g) => {
          lockScroll(false);
          setDragging(false);
          const moved = Math.abs(g.dx) + Math.abs(g.dy);
          if (moved < 8) {
            pan.setValue({ x: 0, y: 0 });
            cb.current.onTap();
            return;
          }
          const zone = dnd ? await dnd.find(g.moveX, g.moveY) : null;
          const ok = zone ? cb.current.onDrop(zone) : false;
          if (ok) pan.setValue({ x: 0, y: 0 });
          else Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 6 }).start();
        },
        onPanResponderTerminate: () => {
          lockScroll(false);
          setDragging(false);
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <Animated.View
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Tocá para colocar, o arrastrá hasta un lugar"
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={() => onTap()}
      style={[style, { transform: pan.getTranslateTransform(), zIndex: dragging ? 100 : 1, elevation: dragging ? 8 : 0, opacity: disabled ? 0.4 : 1 }]}
    >
      {children}
    </Animated.View>
  );
}

// ---------- Demostración breve ----------

export type DemoKind = 'tap' | 'drag' | 'sequence' | 'memory' | 'path' | 'write';

const DEMO_TEXT: Record<DemoKind, string> = {
  tap: 'Escuchá la consigna y tocá tu respuesta. Si necesitás ayuda, tocá la lamparita.',
  drag: 'Arrastrá cada letra a su lugar. También podés tocarla: va sola al primer lugar libre.',
  sequence: 'Arrastrá las escenas a los cuadros, en orden. También podés tocarlas una por una.',
  memory: 'Mirá qué faroles se encienden. Después tocalos en el mismo orden. No hay apuro.',
  path: 'Tocá una casilla de al lado para mover a Tito. Pensá el camino antes de moverte.',
  write: 'Tocá las letras para escribir. Podés escuchar lo que escribiste y corregirlo.',
};

function Hand({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M40 90 Q24 80 20 62 L16 48 Q14 40 22 40 Q28 40 30 48 L34 58 L34 18 Q34 10 42 10 Q50 10 50 18 L50 44 L52 40 Q60 36 64 44 L66 46 Q74 42 78 50 L80 54 Q88 52 88 62 Q88 80 76 90 Z"
        fill="#FFE2C4"
        stroke="#2A3350"
        strokeWidth={4}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Demostración de cómo se juega: una mano muestra el gesto dos veces y se detiene. */
export function Demo({ kind, onClose }: { kind: DemoKind; onClose: () => void }) {
  const { theme } = useStore();
  const reduce = useReduceMotion();
  const t = useRef(new Animated.Value(0)).current;
  const [run, setRun] = useState(0);
  const isDrag = kind === 'drag' || kind === 'sequence';
  useEffect(() => {
    if (reduce) return;
    t.setValue(0);
    const once = Animated.sequence([
      Animated.timing(t, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.delay(350),
      Animated.timing(t, { toValue: 0, duration: 1, useNativeDriver: true }),
      Animated.delay(250),
    ]);
    Animated.sequence([once, once]).start(); // dos veces y se detiene
  }, [run, reduce, t]);
  const handX = t.interpolate({ inputRange: [0, 1], outputRange: isDrag ? [10, 150] : [10, 110] });
  const handY = t.interpolate({ inputRange: [0, 1], outputRange: isDrag ? [70, 0] : [60, 20] });
  const pieceX = t.interpolate({ inputRange: [0, 1], outputRange: [0, 140] });
  const pieceY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -70] });
  const tapScale = t.interpolate({ inputRange: [0, 0.8, 0.9, 1], outputRange: [1, 1, 0.9, 1] });
  return (
    <View style={{ backgroundColor: theme.surface, borderRadius: radius.xl, borderWidth: 3, borderColor: theme.light, padding: 16, gap: 12 }} accessibilityViewIsModal>
      <Row>
        <Lumi size={64} mood="curiosa" animate={!reduce} />
        <Txt size={18} weight="700" style={{ flex: 1 }}>
          Así se juega
        </Txt>
      </Row>
      <View style={{ height: 150, borderRadius: radius.lg, backgroundColor: theme.bg, overflow: 'hidden' }} accessible accessibilityLabel={DEMO_TEXT[kind]}>
        {isDrag ? (
          <>
            <View style={{ position: 'absolute', left: 150, top: 18, width: 56, height: 62, borderRadius: 10, borderWidth: 3, borderStyle: 'dashed', borderColor: theme.border, backgroundColor: theme.surfaceAlt }} />
            <Animated.View style={{ position: 'absolute', left: 10, top: 88, width: 56, height: 56, borderRadius: 12, backgroundColor: theme.light, borderWidth: 2, borderColor: theme.lightInk, alignItems: 'center', justifyContent: 'center', transform: reduce ? [] : [{ translateX: pieceX }, { translateY: pieceY }] }}>
              {kind === 'sequence' ? <Illustration name="brote" size={48} /> : <Txt size={28} weight="800">A</Txt>}
            </Animated.View>
          </>
        ) : (
          <>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  left: 20 + i * 100,
                  top: 20,
                  width: 80,
                  height: 80,
                  borderRadius: 14,
                  backgroundColor: theme.surface,
                  borderWidth: i === 1 ? 4 : 2,
                  borderColor: i === 1 ? theme.ok : theme.border,
                  transform: i === 1 && !reduce ? [{ scale: tapScale }] : [],
                }}
              />
            ))}
          </>
        )}
        <Animated.View style={{ position: 'absolute', left: 0, top: 30, transform: reduce ? [{ translateX: isDrag ? 150 : 110 }, { translateY: 20 }] : [{ translateX: handX }, { translateY: handY }] }}>
          <Hand />
        </Animated.View>
        {reduce && (
          <Svg width={300} height={150} style={{ position: 'absolute' }}>
            <Path d={isDrag ? 'M60 110 Q120 40 170 60' : 'M40 130 Q100 120 140 90'} stroke={theme.sea} strokeWidth={4} fill="none" strokeDasharray="8 6" />
            <Circle cx={isDrag ? 170 : 140} cy={isDrag ? 60 : 90} r={6} fill={theme.sea} />
          </Svg>
        )}
      </View>
      <Txt size={17}>{DEMO_TEXT[kind]}</Txt>
      <Row wrap>
        {!reduce && <Btn label="Ver otra vez" kind="secondary" onPress={() => setRun((r) => r + 1)} style={{ flex: 1 }} />}
        <Btn label="¡Entendido!" icon="check" onPress={onClose} style={{ flex: 1 }} />
      </Row>
    </View>
  );
}

export function demoKindFor(runner: string, activityId: string): DemoKind {
  if (runner === 'build') return 'drag';
  if (runner === 'sequence') return 'sequence';
  if (runner === 'memory') return 'memory';
  if (runner === 'path') return 'path';
  if (runner === 'write' || activityId === 'escrituraPalabras') return 'write';
  return 'tap';
}

export function useTapSfx() {
  const sfx = useSfx();
  return () => sfx('tap');
}
