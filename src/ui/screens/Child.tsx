import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, TextInput, View } from 'react-native';
import Svg, { Path, Ellipse, Circle } from 'react-native-svg';
import { ACTIVITIES } from '../../content/activities';
import { AVATAR_BASES, AVATAR_COLORS, CELEBRATIONS, CHARACTERS, GUIDE_LINES, PATH_LANTERNS, REWARDS, STORY_PAGES } from '../../content/world';
import { createProfile } from '../../domain/profile';
import { PlaceArt } from './WorldMap';
import type { ActivityId } from '../../domain/types';
import { Avatar, CharacterArt, Icon, Lighthouse, Lumi } from '../art';
import { Btn, Card, GuideBubble, IconBtn, Pic, Row, Screen, Txt, useReduceMotion, useSfx, useSpeak } from '../components';
import { MissionSummary, useStore } from '../store';
import { radius } from '../theme';

export function ProfilesScreen() {
  const { profiles, selectProfile, push, reset, theme, ready } = useStore();
  const say = useSpeak();
  useEffect(() => {
    if (ready) say(profiles.length ? '¡Hola! Tocá tu dibujo para empezar.' : '¡Hola! Tocá el botón grande para crear tu explorador.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  if (!ready) return <Screen><Txt>Cargando…</Txt></Screen>;
  return (
    <Screen right={<IconBtn icon="lock" label="Adultos" compact onPress={() => push({ name: 'gate', then: { name: 'adult' } })} />} title=" ">
      <View style={{ alignItems: 'center', gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#DDEFF7', borderRadius: 28, paddingHorizontal: 18, paddingTop: 8, borderWidth: 2, borderColor: theme.border }}>
          <PlaceArt zoneId="isla-palabras" width={150} />
          <Lumi size={92} mood="feliz" animate={false} />
        </View>
        <Txt size={28} weight="800" align="center" accessibilityRole="header" color={theme.seaDeep}>
          El Faro de las Palabras
        </Txt>
        <IconBtn icon="speaker" label="Escuchar" onPress={() => say(profiles.length ? 'Tocá tu dibujo para empezar.' : 'Tocá el botón grande para crear tu explorador.')} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {profiles.map((p) => (
          <Card
            key={p.id}
            label={`Perfil ${p.alias}`}
            onPress={() => {
              selectProfile(p.id);
              reset(p.welcomed ? { name: 'welcome' } : { name: 'welcome' });
            }}
            style={{ width: 150, alignItems: 'center', gap: 6 }}
          >
            <Avatar {...p.avatar} size={88} />
            <Txt size={18} weight="700" align="center">
              {p.alias}
            </Txt>
          </Card>
        ))}
      </View>
      <Btn label="Nuevo explorador" icon="pencil" big onPress={() => push({ name: 'createProfile' })} />
      <Txt size={13} color={theme.inkSoft} align="center">
        Todo se guarda solo en este dispositivo. Sin publicidad ni compras.
      </Txt>
    </Screen>
  );
}

export function CreateProfileScreen() {
  const { addProfile, back, selectProfile, reset, theme } = useStore();
  const say = useSpeak();
  const [alias, setAlias] = useState('');
  const [base, setBase] = useState(0);
  const [color, setColor] = useState(0);
  useEffect(() => {
    say('Elegí tu personaje y su color. Después, con ayuda de un adulto si hace falta, escribí un apodo.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const valid = alias.trim().length >= 2;
  return (
    <Screen title="Tu explorador" onBack={back}>
      <View style={{ alignItems: 'center' }}>
        <Avatar base={base} color={color} size={130} />
      </View>
      <Txt size={18} weight="700">
        Personaje
      </Txt>
      <Row wrap gap={8} style={{ justifyContent: 'center' }}>
        {AVATAR_BASES.map((name, k) => (
          <Card key={name} label={name} selected={k === base} onPress={() => { setBase(k); say(name); }} style={{ padding: 6, alignItems: 'center', width: 96 }}>
            <Avatar base={k} color={color} size={60} />
            <Txt size={14}>{name}</Txt>
          </Card>
        ))}
      </Row>
      <Txt size={18} weight="700">
        Color
      </Txt>
      <Row wrap gap={8} style={{ justifyContent: 'center' }}>
        {AVATAR_COLORS.map((c, k) => (
          <Pressable
            key={c.name}
            accessibilityRole="button"
            accessibilityLabel={`Color ${c.name}`}
            accessibilityState={{ selected: k === color }}
            onPress={() => { setColor(k); say(c.name); }}
            style={{ alignItems: 'center', gap: 2, padding: 4, borderRadius: radius.md, borderWidth: k === color ? 4 : 2, borderColor: k === color ? theme.seaDeep : theme.border, backgroundColor: theme.surface, width: 84 }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.hex }} />
            <Txt size={13}>{c.name}</Txt>
          </Pressable>
        ))}
      </Row>
      <Txt size={18} weight="700">
        Apodo (no hace falta el nombre real)
      </Txt>
      <TextInput
        value={alias}
        onChangeText={(t) => setAlias(t.slice(0, 16))}
        placeholder="Por ejemplo: Rayo"
        placeholderTextColor={theme.inkSoft}
        accessibilityLabel="Apodo"
        autoCorrect={false}
        style={{ fontSize: theme.fs(22), padding: 14, borderRadius: radius.md, borderWidth: 2, borderColor: theme.sea, backgroundColor: theme.surface, color: theme.ink, minHeight: 56 }}
      />
      <Btn
        label="¡Listo!"
        icon="check"
        big
        disabled={!valid}
        onPress={async () => {
          const p = createProfile(alias, { base, color, accessory: null });
          await addProfile(p);
          selectProfile(p.id);
          reset({ name: 'welcome' });
        }}
      />
    </Screen>
  );
}

export function WelcomeScreen() {
  const { current, reset, updateCurrent } = useStore();
  const p = current!;
  const first = !p.welcomed;
  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Avatar {...p.avatar} size={90} />
      </View>
      <GuideBubble size={120} text={first ? GUIDE_LINES.welcomeNew(p.alias) : GUIDE_LINES.welcomeBack(p.alias)} />
      {first ? (
        <View style={{ gap: 10 }}>
          <Card>
            <Row>
              <Lighthouse size={70} lit={0} />
              <View style={{ flex: 1 }}>
                <Txt size={16}>{CHARACTERS.lumi.story}</Txt>
              </View>
            </Row>
          </Card>
          <Btn
            label="¡Vamos!"
            icon="play"
            big
            onPress={() => {
              updateCurrent((x) => ({ ...x, welcomed: true }));
              reset({ name: 'exploration' });
            }}
          />
        </View>
      ) : (
        <Btn label="Ir al mapa" icon="play" big onPress={() => reset({ name: 'map' })} />
      )}
    </Screen>
  );
}

/** Hilera de faroles del camino: los encendidos son misiones jugadas. El último encendido aparece con un pequeño destello. */
function LanternRow({ lit, highlightLast }: { lit: number; highlightLast?: boolean }) {
  const reduce = useReduceMotion();
  const pop = useRef(new Animated.Value(reduce || !highlightLast ? 1 : 0)).current;
  useEffect(() => {
    if (reduce || !highlightLast) return;
    Animated.timing(pop, { toValue: 1, duration: 500, delay: 300, easing: Easing.out(Easing.back(2)), useNativeDriver: true }).start();
  }, [reduce, highlightLast, pop]);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }} accessibilityLabel={`Faroles encendidos: ${lit} de ${PATH_LANTERNS}`}>
      {Array.from({ length: PATH_LANTERNS }).map((_, i) => {
        const on = i < lit;
        const isNew = highlightLast && i === lit - 1;
        return (
          <Animated.View key={i} style={{ opacity: on ? 1 : 0.3, transform: isNew ? [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }] : [] }}>
            <Pic pic="farol" size={isNew ? 40 : 26} />
          </Animated.View>
        );
      })}
    </View>
  );
}

export function MissionEndScreen({ activityId, summary }: { activityId: ActivityId; summary: MissionSummary }) {
  const { replace, reset, theme, current } = useStore();
  const sfx = useSfx();
  const [cheer] = useState(() => CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)]);
  useEffect(() => {
    sfx('premio');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const lines: string[] = [];
  if (summary.autonomo) lines.push(`Resolviste ${summary.autonomo} sin ayuda.`);
  if (summary.conApoyo) lines.push(`Resolviste ${summary.conApoyo} con pistas o probando otra vez.`);
  if (summary.abierta) lines.push(`Guardé ${summary.abierta === 1 ? 'tu producción' : `tus ${summary.abierta} producciones`}.`);
  if (summary.noResuelto) lines.push(`${summary.noResuelto === 1 ? 'Una quedó' : `${summary.noResuelto} quedaron`} para practicar otro día.`);
  const text = `${cheer} Terminaste la misión. ${lines.join(' ')}`;
  const lit = Math.min(PATH_LANTERNS, current?.missionsCompleted ?? 0);
  return (
    <Screen title="¡Misión cumplida!">
      <GuideBubble mood="celebra" size={100} text={text} />
      <Card style={{ gap: 10, alignItems: 'center', backgroundColor: theme.warnBg }}>
        <Txt size={17} weight="800" align="center">
          Se encendió un farol del camino
        </Txt>
        <LanternRow lit={lit} highlightLast />
        {summary.newPage && (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Pic pic="libro" size={48} />
            <Txt size={16} style={{ flex: 1 }}>
              Recuperaste una página de la historia: “{summary.newPage}”
            </Txt>
          </View>
        )}
        {summary.newReward && current && (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Avatar {...current.avatar} accessory={REWARDS.find((r) => r.name === summary.newReward)?.id ?? null} size={56} />
            <Txt size={16} weight="700" style={{ flex: 1 }}>
              Nuevo en tu ropero: {summary.newReward}
            </Txt>
          </View>
        )}
      </Card>
      {summary.strategies.length > 0 && (
        <Card>
          <Txt size={17} weight="700">
            Estrategias que usaste
          </Txt>
          {summary.strategies.map((s) => (
            <Txt key={s} size={16}>
              • {s}
            </Txt>
          ))}
        </Card>
      )}
      <Btn label="Otra misión igual" icon="play" big onPress={() => replace({ name: 'mission', activityId })} />
      <Btn label="Volver al mapa" kind="secondary" onPress={() => reset({ name: 'map' })} />
    </Screen>
  );
}

export function StoryScreen() {
  const { current, back, theme } = useStore();
  const say = useSpeak();
  const p = current!;
  return (
    <Screen title="La historia del faro" onBack={back}>
      <View style={{ alignItems: 'center' }}>
        <Lighthouse size={110} lit={p.rewards.storyPages / STORY_PAGES.length} />
        <Txt size={15} color={theme.inkSoft}>
          Cada misión que jugás enciende un poco más la luz.
        </Txt>
      </View>
      {STORY_PAGES.map((page, i) =>
        i < p.rewards.storyPages ? (
          <Card key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Txt size={17} style={{ flex: 1 }}>
              {page}
            </Txt>
            <IconBtn icon="speaker" label="Escuchar" compact onPress={() => say(page)} />
          </Card>
        ) : (
          <Card key={i} style={{ opacity: 0.55, borderStyle: 'dashed' }}>
            <Txt size={16} color={theme.inkSoft}>
              Página por descubrir
            </Txt>
          </Card>
        ),
      )}
    </Screen>
  );
}

export function WardrobeScreen() {
  const { current, back, updateCurrent, theme } = useStore();
  const say = useSpeak();
  const p = current!;
  return (
    <Screen title="Mi ropero" onBack={back}>
      <View style={{ alignItems: 'center' }}>
        <Avatar {...p.avatar} size={140} />
      </View>
      <Txt size={15} color={theme.inkSoft} align="center">
        Los accesorios se ganan jugando misiones. Nunca se pierden.
      </Txt>
      <Row wrap gap={10} style={{ justifyContent: 'center' }}>
        <Card label="Sin accesorio" selected={!p.avatar.accessory} onPress={() => updateCurrent((x) => ({ ...x, avatar: { ...x.avatar, accessory: null } }))} style={{ width: 120, alignItems: 'center' }}>
          <Avatar {...p.avatar} accessory={null} size={64} />
          <Txt size={14}>Sin nada</Txt>
        </Card>
        {REWARDS.map((r) => {
          const has = p.rewards.unlocked.includes(r.id);
          return (
            <Card
              key={r.id}
              label={has ? r.name : `${r.name}, todavía no`}
              selected={p.avatar.accessory === r.id}
              onPress={() => {
                if (!has) return say('Este accesorio aparece cuando juegues más misiones.');
                say(r.name);
                updateCurrent((x) => ({ ...x, avatar: { ...x.avatar, accessory: r.id } }));
              }}
              style={{ width: 120, alignItems: 'center', opacity: has ? 1 : 0.45 }}
            >
              <Avatar {...p.avatar} accessory={r.id} size={64} />
              <Txt size={14} align="center">
                {has ? r.name : '¿?'}
              </Txt>
            </Card>
          );
        })}
      </Row>
    </Screen>
  );
}

export function GoodbyeScreen() {
  const { current, endSession, reset, back, sessionId } = useStore();
  const [closed, setClosed] = useState(false);
  const [closedSession, setClosedSession] = useState<string | null>(null);
  const p = current!;
  if (!closed)
    return (
      <Screen title="¿Terminamos por hoy?" onBack={back}>
        <GuideBubble mood="escucha" text="¿Querés terminar por hoy? Todo lo que hiciste ya está guardado." />
        <Btn
          label="Sí, terminar"
          icon="door"
          big
          onPress={() => {
            setClosedSession(sessionId);
            endSession();
            setClosed(true);
          }}
        />
        <Btn label="Seguir jugando" kind="secondary" onPress={back} />
      </Screen>
    );
  const today = p.sessions.find((x) => x.id === closedSession)?.missions ?? 0;
  const lit = Math.min(PATH_LANTERNS, p.missionsCompleted);
  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Lumi size={130} mood="feliz" />
      </View>
      <GuideBubble
        size={0}
        dismissible={false}
        text={
          today > 0
            ? `Hoy jugaste ${today} misión${today === 1 ? '' : 'es'} y el camino quedó más iluminado. ${GUIDE_LINES.goodbye(p.alias)}`
            : GUIDE_LINES.goodbye(p.alias)
        }
      />
      <Card style={{ alignItems: 'center', gap: 8 }}>
        <Txt size={16} weight="800">
          Tu camino de faroles
        </Txt>
        <LanternRow lit={lit} />
        <Row gap={8}>
          <Lighthouse size={60} lit={p.rewards.storyPages / STORY_PAGES.length} />
          <Txt size={15} style={{ flex: 1 }}>
            Páginas de la historia recuperadas: {p.rewards.storyPages} de {STORY_PAGES.length}.
          </Txt>
        </Row>
      </Card>
      <Btn label="Elegir perfil" big onPress={() => reset({ name: 'profiles' })} />
    </Screen>
  );
}
