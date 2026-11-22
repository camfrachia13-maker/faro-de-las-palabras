import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from './store';
import { Icon, IconName, Lumi, Mood } from './art';
import { MIN_TOUCH, radius } from './theme';
import { onSpeakingChange, speak } from '../services/voice';
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
  const inner = <View style={[styles.inner, padded && { padding: 16 }]}>{children}</View>;
  return (
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: 'center' }}>{inner}</View>
      )}
    </SafeAreaView>
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: kind === 'secondary' ? theme.border : kind === 'ghost' ? 'transparent' : bg,
          minHeight: big ? 68 : MIN_TOUCH,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
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
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [s, style, { opacity: pressed ? 0.85 : 1 }]}>
      {children}
    </Pressable>
  );
}

/** Pictograma provisorio (emoji del sistema) en un marco. */
export function Pic({ pic, size = 64, label }: { pic: string; size?: number; label?: string }) {
  return (
    <Text accessibilityLabel={label} accessible={!!label} style={{ fontSize: size, lineHeight: size * 1.2, textAlign: 'center' }}>
      {pic}
    </Text>
  );
}

/** Lumi con globo de diálogo. Lee el texto en voz alta si está activada la lectura automática. */
export function GuideBubble({ text, mood = 'feliz', size = 96, autoSpeak = true, speakText }: { text: string; mood?: Mood; size?: number; autoSpeak?: boolean; speakText?: string }) {
  const { theme } = useStore();
  const settings = useSettings();
  const say = useSpeak();
  useEffect(() => {
    if (autoSpeak && settings.autoRead) say(speakText ?? text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' }}>
      <Lumi size={size} mood={mood} animate={!settings.reduceMotion} />
      <View style={{ flex: 1, backgroundColor: theme.surface, borderRadius: radius.lg, borderWidth: 2, borderColor: theme.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ flex: 1 }}>
          <Txt size={17}>{text}</Txt>
        </View>
        <IconBtn icon="speaker" label="Escuchar" compact onPress={() => say(speakText ?? text)} />
      </View>
    </View>
  );
}

export function Feedback({ kind, text, children }: { kind: 'ok' | 'retry' | 'info'; text: string; children?: React.ReactNode }) {
  const { theme } = useStore();
  const bg = kind === 'ok' ? theme.okBg : kind === 'retry' ? theme.warnBg : theme.infoBg;
  const say = useSpeak();
  useEffect(() => {
    say(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <View accessibilityLiveRegion="polite" style={{ backgroundColor: bg, borderRadius: radius.lg, padding: 14, gap: 10, borderWidth: 2, borderColor: theme.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Lumi size={56} mood={kind === 'ok' ? 'celebra' : 'pensando'} animate={false} />
        <View style={{ flex: 1 }}>
          <Txt size={17} weight="600">
            {text}
          </Txt>
        </View>
        <IconBtn icon="speaker" label="Escuchar" compact onPress={() => say(text)} />
      </View>
      {children}
    </View>
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
