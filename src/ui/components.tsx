import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from './store';
import { Icon, IconName, Lumi, Mood } from './art';
import { MIN_TOUCH, radius } from './theme';
import { onSpeakingChange, speak, stopSpeaking, unlockAudio } from '../services/voice';
import { playSfx, Sfx } from '../services/sfx';
import { Illustration } from './illustrations';
import { DEFAULT_SETTINGS } from '../domain/profile';

export function useSettings() {
  const { current } = useStore();
  return current?.settings ?? DEFAULT_SETTINGS;
}

export function useSpeak() {
  const s = useSettings();
  return (text: string, onDone?: () => void) => speak(text, s, onDone);
}

export function useSpeaking() {
  const [v, setV] = useState(false);
  useEffect(() => onSpeakingChange(setV), []);
  return v;
}

export function Txt({ children, size = 18, weight = '400', color, style, align, accessibilityRole }: {
  children: React.ReactNode;
  size?: number;
  weight?: TextStyle['fontWeight'];
  color?: string;
  style?: TextStyle;
  align?: TextStyle['textAlign'];
  accessibilityRole?: 'header' | 'text';
}) {
  const { theme } = useStore();
  return (
    <Text accessibilityRole={accessibilityRole} style={[{ fontSize: theme.fs(size), lineHeight: theme.fs(size) * 1.35, fontWeight: weight, color: color ?? theme.ink, textAlign: align }, style]}>
      {children}
    </Text>
  );
}

/** Bloquea el scroll de la pantalla mientras se arrastra una pieza. */
export const ScrollLockCtx = React.createContext<(locked: boolean) => void>(() => {});

export function Screen({ children, title, onBack, right, scroll = true, bg, padded = true }: {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  scroll?: boolean;
  bg?: string;
  padded?: boolean;
}) {
  const { theme } = useStore();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const inner = <View style={[styles.inner, padded && { padding: 16 }]}>{children}</View>;
  return (
    <ScrollLockCtx.Provider value={(locked: boolean) => setScrollEnabled(!locked)}>
    <SafeAreaView style={{ flex: 1, backgroundColor: bg ?? theme.bg }} edges={['top', 'bottom', 'left', 'right']}>
      {(title || onBack || right) && (
        <View style={[styles.topbar]}>
          <View style={{ width: MIN_TOUCH }}>
            {onBack && <IconBtn icon="back" label="Volver" onPress={onBack} compact />}
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            {title ? (
              <Txt size={18} weight="700" align="center" accessibilityRole="header">
                {title}
              </Txt>
            ) : null}
          </View>
          <View style={{ minWidth: MIN_TOUCH, alignItems: 'flex-end' }}>{right}</View>
        </View>
      )}
      {scroll ? (
        <ScrollView scrollEnabled={scrollEnabled} contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: 'center' }}>{inner}</View>
      )}
    </SafeAreaView>
    </ScrollLockCtx.Provider>
  );
}

export function Btn({ label, onPress, kind = 'primary', icon, disabled, style, big, accessibilityHint }: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'light';
  icon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
  big?: boolean;
  accessibilityHint?: string;
}) {
  const { theme } = useStore();
  const bg = { primary: theme.sea, secondary: theme.surface, ghost: 'transparent', danger: theme.coral, light: theme.light }[kind];
  const fg = { primary: '#FFFFFF', secondary: theme.ink, ghost: theme.sea, danger: '#FFFFFF', light: theme.ink }[kind];
  const depth = { primary: theme.seaDeep, secondary: '#D8C7A6', ghost: 'transparent', danger: '#8E3A27', light: '#C98F1E' }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        unlockAudio();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: kind === 'secondary' ? theme.border : kind === 'ghost' ? 'transparent' : bg,
          // relieve de "botón de juego": el borde inferior más oscuro se achica al apretar
          borderBottomWidth: kind === 'ghost' ? 2 : pressed ? 2 : 5,
          borderBottomColor: kind === 'ghost' ? 'transparent' : depth,
          marginTop: pressed && kind !== 'ghost' ? 3 : 0,
          minHeight: big ? 68 : MIN_TOUCH,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} color={fg} size={big ? 28 : 24} />}
      <Text style={{ color: fg, fontSize: theme.fs(big ? 21 : 18), fontWeight: '700', textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

export function IconBtn({ icon, label, onPress, compact, active, disabled }: { icon: IconName; label: string; onPress: () => void; compact?: boolean; active?: boolean; disabled?: boolean }) {
  const { theme } = useStore();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minWidth: MIN_TOUCH,
          minHeight: MIN_TOUCH,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.md,
          paddingHorizontal: compact ? 4 : 8,
          backgroundColor: active ? theme.warnBg : compact ? 'transparent' : theme.surface,
          borderWidth: compact ? 0 : 2,
          borderColor: theme.border,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Icon name={icon} size={compact ? 28 : 26} color={theme.seaDeep} />
      {!compact && <Text style={{ fontSize: theme.fs(13), color: theme.ink, fontWeight: '600', marginTop: 2 }}>{label}</Text>}
    </Pressable>
  );
}

export function Card({ children, style, onPress, label, selected }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void; label?: string; selected?: boolean }) {
  const { theme } = useStore();
  const s: ViewStyle = {
    backgroundColor: theme.surface,
    borderRadius: radius.lg,
    borderWidth: selected ? 4 : 2,
    borderColor: selected ? theme.seaDeep : theme.border,
    padding: 16,
  };
  if (!onPress) return <View style={[s, style]}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={() => { unlockAudio(); onPress(); }} style={({ pressed }) => [s, style, { opacity: pressed ? 0.85 : 1 }]}>
      {children}
    </Pressable>
  );
}

/** Ilustración(es) original(es). Varias claves unidas con "+" forman una escena (p. ej. "gato+pera"). */
export function Pic({ pic, size = 64, label }: { pic: string; size?: number; label?: string }) {
  const keys = pic.split('+').filter(Boolean);
  if (keys.length === 1) return <Illustration name={keys[0]} size={size} label={label} />;
  const each = keys.length > 2 ? size * 0.62 : size * 0.8;
  return (
    <View accessible={!!label} accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
      {keys.map((k, i) => (
        <View key={`${k}${i}`} style={{ marginLeft: i ? -each * 0.12 : 0 }}>
          <Illustration name={k} size={each} />
        </View>
      ))}
    </View>
  );
}

/** true si hay que evitar animaciones: ajuste del perfil o preferencia del sistema. */
export function useReduceMotion() {
  const settings = useSettings();
  const [os, setOs] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setOs)
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setOs);
    return () => sub?.remove?.();
  }, []);
  return settings.reduceMotion || os;
}

export function useSfx() {
  const settings = useSettings();
  return (name: Sfx) => playSfx(name, settings);
}

/**
 * Lumi con globo de diálogo. Lee el texto si la lectura automática está activa.
 * Mueve la boca solo mientras su propia voz suena. "Omitir" corta la voz y
 * cierra el globo; tocando a Lumi se vuelve a escuchar.
 */
export function GuideBubble({ text, mood = 'feliz', size = 96, autoSpeak = true, speakText, dismissible = true }: {
  text: string;
  mood?: Mood;
  size?: number;
  autoSpeak?: boolean;
  speakText?: string;
  dismissible?: boolean;
}) {
  const { theme } = useStore();
  const settings = useSettings();
  const reduce = useReduceMotion();
  const speaking = useSpeaking();
  const [mine, setMine] = useState(false);
  const [hidden, setHidden] = useState(false);
  const say = useSpeak();
  const talk = () => {
    setMine(true);
    say(speakText ?? text, () => setMine(false));
  };
  useEffect(() => {
    setHidden(false);
    if (autoSpeak && settings.autoRead && !settings.guideBrief) talk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  useEffect(() => {
    if (!speaking) setMine(false);
  }, [speaking]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: '100%' }}>
      {size > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Lumi: volver a escuchar" onPress={() => { setHidden(false); talk(); }}>
          <Lumi size={size} mood={mood} animate={!reduce} talking={mine && speaking} />
        </Pressable>
      )}
      {!hidden ? (
        <View style={{ flex: 1, backgroundColor: theme.surface, borderRadius: radius.lg, borderWidth: 2, borderColor: theme.border, paddingVertical: 10, paddingLeft: 14, paddingRight: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ flex: 1 }}>
            <Txt size={17}>{text}</Txt>
          </View>
          <View>
            <IconBtn icon="speaker" label="Escuchar" compact onPress={talk} />
            {dismissible && (
              <IconBtn
                icon="close"
                label="Omitir"
                compact
                onPress={() => {
                  stopSpeaking();
                  setHidden(true);
                }}
              />
            )}
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }} />
      )}
    </View>
  );
}

/** Festejo breve: unas pocas estrellas que salen y se van (una sola vez, sin destellos). */
export function Burst({ show }: { show: boolean }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!show || reduce) return;
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [show, reduce, v]);
  if (!show || reduce) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center' }}>
      {[-1, -0.4, 0.3, 1].map((dir, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
            transform: [
              { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, dir * 110] }) },
              { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -50 - (i % 2) * 30] }) },
              { scale: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.1, 0.8] }) },
            ],
          }}
        >
          <Illustration name="estrella" size={34} />
        </Animated.View>
      ))}
    </View>
  );
}

/**
 * Devolución: Lumi reacciona (celebra breve, da aliento o explica) y lo dice en voz alta.
 * Los festejos son cortos y variados; los errores se acompañan sin retar.
 */
export function Feedback({ kind, text, children }: { kind: 'ok' | 'retry' | 'info'; text: string; children?: React.ReactNode }) {
  const { theme } = useStore();
  const reduce = useReduceMotion();
  const speaking = useSpeaking();
  const sfx = useSfx();
  const bg = kind === 'ok' ? theme.okBg : kind === 'retry' ? theme.warnBg : theme.infoBg;
  const say = useSpeak();
  const [mine, setMine] = useState(false);
  const slide = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    sfx(kind === 'ok' ? 'acierto' : kind === 'retry' ? 'otra' : 'tap');
    setMine(true);
    say(text, () => setMine(false));
    if (!reduce) Animated.timing(slide, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={{
        backgroundColor: bg,
        borderRadius: radius.lg,
        padding: 14,
        gap: 10,
        borderWidth: 2,
        borderColor: kind === 'ok' ? theme.ok : theme.border,
        opacity: slide,
        transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
      }}
    >
      <Burst show={kind === 'ok'} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Lumi size={64} mood={kind === 'ok' ? 'celebra' : kind === 'retry' ? 'aliento' : 'pensando'} animate={!reduce} talking={mine && speaking} />
        <View style={{ flex: 1 }}>
          <Txt size={17} weight="600">
            {text}
          </Txt>
        </View>
        <IconBtn icon="speaker" label="Escuchar" compact onPress={() => { setMine(true); say(text, () => setMine(false)); }} />
      </View>
      {children}
    </Animated.View>
  );
}

export function Row({ children, gap = 10, wrap, style }: { children: React.ReactNode; gap?: number; wrap?: boolean; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', gap, flexWrap: wrap ? 'wrap' : 'nowrap', alignItems: 'center' }, style]}>{children}</View>;
}

export function Toggle({ label, value, onChange, help }: { label: string; value: boolean; onChange: (v: boolean) => void; help?: string }) {
  const { theme } = useStore();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: MIN_TOUCH, paddingVertical: 6 }}
    >
      <View style={{ flex: 1 }}>
        <Txt size={16} weight="600">
          {label}
        </Txt>
        {help ? (
          <Txt size={14} color={theme.inkSoft}>
            {help}
          </Txt>
        ) : null}
      </View>
      <View style={{ width: 58, height: 34, borderRadius: 17, backgroundColor: value ? theme.sea : '#CFC6B4', padding: 3, alignItems: value ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          {value && <Icon name="check" size={18} color={theme.sea} />}
        </View>
      </View>
      <Text style={{ position: 'absolute', opacity: 0 }}>{value ? 'Activado' : 'Desactivado'}</Text>
    </Pressable>
  );
}

export function Stepper({ label, value, min, max, step = 1, format, onChange }: { label: string; value: number; min: number; max: number; step?: number; format?: (v: number) => string; onChange: (v: number) => void }) {
  const { theme } = useStore();
  const round = (v: number) => Math.round(v * 100) / 100;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: MIN_TOUCH }}>
      <View style={{ flex: 1 }}>
        <Txt size={16} weight="600">
          {label}
        </Txt>
      </View>
      <Btn label="−" kind="secondary" onPress={() => onChange(Math.max(min, round(value - step)))} disabled={value <= min} style={{ paddingHorizontal: 18 }} />
      <View style={{ minWidth: 64, alignItems: 'center' }}>
        <Txt size={17} weight="700" color={theme.seaDeep}>
          {format ? format(value) : String(value)}
        </Txt>
      </View>
      <Btn label="+" kind="secondary" onPress={() => onChange(Math.min(max, round(value + step)))} disabled={value >= max} style={{ paddingHorizontal: 18 }} />
    </View>
  );
}

const LETTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

/** Teclado de letras grandes (no depende del teclado del sistema). */
export function LetterKeyboard({ onKey, onDelete, onSpace, lowercase, extraKeys }: { onKey: (ch: string) => void; onDelete: () => void; onSpace?: () => void; lowercase?: boolean; extraKeys?: string[] }) {
  const { theme } = useStore();
  const { width } = useWindowDimensions();
  const w = Math.min(width, 560) - 32;
  const perRow = w < 360 ? 7 : 9;
  const key = Math.floor((w - (perRow - 1) * 6) / perRow);
  const keys = [...LETTERS, ...(extraKeys ?? [])];
  return (
    <View style={{ gap: 6, width: w }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {keys.map((l) => {
          const ch = lowercase ? l.toLowerCase() : l;
          return (
            <Pressable
              key={l}
              accessibilityRole="button"
              accessibilityLabel={`Letra ${l}`}
              onPress={() => onKey(ch)}
              style={({ pressed }) => ({
                width: key,
                height: Math.max(48, key * 1.1),
                borderRadius: 10,
                backgroundColor: pressed ? theme.warnBg : theme.surface,
                borderWidth: 2,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Text style={{ fontSize: theme.fs(22), fontWeight: '700', color: theme.ink }}>{ch}</Text>
            </Pressable>
          );
        })}
      </View>
      <Row>
        {onSpace && <Btn label="Espacio" kind="secondary" onPress={onSpace} style={{ flex: 2 }} />}
        <Btn label="Borrar" icon="undo" kind="secondary" onPress={onDelete} style={{ flex: 1 }} />
      </Row>
    </View>
  );
}

export const caseText = (s: string, lc: 'mayuscula' | 'minuscula') => (lc === 'mayuscula' ? s.toUpperCase() : s);

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: 560, flexGrow: 1, gap: 14 },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, width: '100%', maxWidth: 600, alignSelf: 'center' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : {}),
  },
});
