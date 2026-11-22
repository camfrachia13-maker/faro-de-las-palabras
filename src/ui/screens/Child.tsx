import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Ellipse, Circle } from 'react-native-svg';
import { ACTIVITIES } from '../../content/activities';
import { AVATAR_BASES, AVATAR_COLORS, CHARACTERS, GUIDE_LINES, REWARDS, STORY_PAGES, ZONES } from '../../content/world';
import { createProfile } from '../../domain/profile';
import type { ActivityId } from '../../domain/types';
import { Avatar, CharacterArt, Icon, Lighthouse, Lumi } from '../art';
import { Btn, Card, GuideBubble, IconBtn, Row, Screen, Txt, useSpeak } from '../components';
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
        <Lighthouse size={96} lit={0.6} />
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

export function MapScreen() {
  const { current, push, theme } = useStore();
  const { width } = useWindowDimensions();
  const p = current!;
  const w = Math.min(width, 560) - 32;
  const h = w * 1.1;
  return (
    <Screen
      title="Mapa del archipiélago"
      right={<IconBtn icon="door" label="Terminar por hoy" compact onPress={() => push({ name: 'goodbye' })} />}
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={8}>
          <Avatar {...p.avatar} size={52} />
          <Txt size={18} weight="700">
            {p.alias}
          </Txt>
        </Row>
        <Row gap={4} style={{ backgroundColor: theme.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderColor: theme.border }}>
          <Icon name="shell" size={22} color={theme.lightInk} />
          <Txt size={16} weight="700">
            {p.rewards.shells}
          </Txt>
        </Row>
      </Row>
      <GuideBubble size={64} text={GUIDE_LINES.mapHint} />
      {!p.exploration && (
        <Btn label="Jugar a conocernos con Lumi" icon="play" kind="light" onPress={() => push({ name: 'exploration' })} />
      )}
      <View style={{ width: w, height: h, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#9CCBE0', borderWidth: 3, borderColor: theme.seaDeep }}>
        <Svg width={w} height={h} viewBox="0 0 100 110" style={{ position: 'absolute' }}>
          {[15, 35, 55, 75, 95].map((y) => (
            <Path key={y} d={`M0 ${y} q12 -3 25 0 t25 0 t25 0 t25 0`} stroke="#B9DDED" strokeWidth={0.8} fill="none" />
          ))}
          <Path d="M27 26 Q50 30 73 51 M27 26 Q22 50 27 75 M73 51 Q78 72 73 95" stroke="#F6EBD6" strokeWidth={1.2} strokeDasharray="2 2" fill="none" />
          {ZONES.map((z) => (
            <Ellipse key={z.id} cx={z.pos.x * 100} cy={z.pos.y * 110} rx={17} ry={11} fill="#E9D7A8" stroke="#B9A072" strokeWidth={0.8} />
          ))}
          <Circle cx={50} cy={56} r={6} fill="#F6EBD6" />
        </Svg>
        <View style={{ position: 'absolute', left: w * 0.5 - 22, top: h * 0.5 - 40 }} accessibilityLabel="El faro">
          <Lighthouse size={44} lit={p.rewards.storyPages / STORY_PAGES.length} />
        </View>
        {ZONES.map((z) => {
          const locked = p.missionsCompleted < z.unlockAtMissions;
          const bw = Math.min(150, w * 0.42);
          return (
            <Pressable
              key={z.id}
              accessibilityRole="button"
              accessibilityLabel={locked ? `${z.name}, se abre después de ${z.unlockAtMissions} misiones` : z.name}
              onPress={() => push({ name: 'zone', zoneId: z.id })}
              style={({ pressed }) => ({
                position: 'absolute',
                left: z.pos.x * w - bw / 2,
                top: z.pos.y * h - 52,
                width: bw,
                alignItems: 'center',
                backgroundColor: locked ? 'rgba(255,255,255,0.7)' : theme.surface,
                borderRadius: radius.lg,
                borderWidth: 2,
                borderColor: locked ? theme.border : theme.seaDeep,
                padding: 6,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <CharacterArt id={z.host} size={46} />
              <Text style={{ fontSize: theme.fs(14), fontWeight: '800', color: theme.ink, textAlign: 'center' }}>{z.name}</Text>
              {locked && (
                <Row gap={4}>
                  <Icon name="lock" size={16} color={theme.inkSoft} />
                  <Text style={{ fontSize: theme.fs(12), color: theme.inkSoft }}>Jugá {z.unlockAtMissions - p.missionsCompleted} misión{z.unlockAtMissions - p.missionsCompleted > 1 ? 'es' : ''}</Text>
                </Row>
              )}
            </Pressable>
          );
        })}
      </View>
      <Row wrap>
        <Btn label="Mi historia" icon="eye" kind="secondary" onPress={() => push({ name: 'story' })} style={{ flex: 1 }} />
        <Btn label="Mi ropero" icon="pencil" kind="secondary" onPress={() => push({ name: 'wardrobe' })} style={{ flex: 1 }} />
      </Row>
      <Btn label="Terminar por hoy" icon="door" kind="ghost" onPress={() => push({ name: 'goodbye' })} />
    </Screen>
  );
}

export function ZoneScreen({ zoneId }: { zoneId: string }) {
  const { current, push, back, updateCurrent, theme } = useStore();
  const p = current!;
  const z = ZONES.find((x) => x.id === zoneId)!;
  const host = CHARACTERS[z.host];
  const locked = p.missionsCompleted < z.unlockAtMissions;
  useEffect(() => {
    if (!locked && !p.zonesVisited.includes(z.id)) updateCurrent((x) => ({ ...x, zonesVisited: [...x.zonesVisited, z.id] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const acts = z.activities.filter((a) => p.skills[a].enabled);
  return (
    <Screen title={z.name} onBack={back}>
      <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <CharacterArt id={z.host} size={90} />
        <View style={{ flex: 1, gap: 4 }}>
          <Txt size={18} weight="800">
            {host.name}
          </Txt>
          <Txt size={15} color={theme.inkSoft}>
            {host.role}
          </Txt>
        </View>
      </Card>
      <GuideBubble
        size={60}
        text={locked ? `Esta isla se abre cuando juegues ${z.unlockAtMissions - p.missionsCompleted} misión${z.unlockAtMissions - p.missionsCompleted > 1 ? 'es' : ''} más. ¡Cualquier misión cuenta!` : host.story}
      />
      {!locked &&
        acts.map((a: ActivityId) => {
          const d = ACTIVITIES[a];
          return (
            <Card key={a} label={d.kidTitle} onPress={() => push({ name: 'mission', activityId: a })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 40 }}>{d.icon}</Text>
              <View style={{ flex: 1 }}>
                <Txt size={19} weight="700">
                  {d.kidTitle}
                </Txt>
              </View>
              <Icon name="play" size={28} color={theme.sea} />
            </Card>
          );
        })}
      {!locked && acts.length === 0 && <Txt>Un adulto pausó estas misiones por ahora.</Txt>}
    </Screen>
  );
}

export function MissionEndScreen({ activityId, summary }: { activityId: ActivityId; summary: MissionSummary }) {
  const { replace, reset, theme } = useStore();
  const lines: string[] = [];
  if (summary.autonomo) lines.push(`Resolviste ${summary.autonomo} sin ayuda.`);
  if (summary.conApoyo) lines.push(`Resolviste ${summary.conApoyo} con pistas o probando otra vez.`);
  if (summary.abierta) lines.push(`Guardé ${summary.abierta === 1 ? 'tu producción' : `tus ${summary.abierta} producciones`}.`);
  if (summary.noResuelto) lines.push(`${summary.noResuelto === 1 ? 'Una quedó' : `${summary.noResuelto} quedaron`} para practicar otro día.`);
  const text = `¡Terminaste la misión! ${lines.join(' ')}`;
  return (
    <Screen title="¡Misión cumplida!">
      <GuideBubble mood="celebra" size={110} text={text} />
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
      <Card style={{ backgroundColor: theme.warnBg, gap: 6 }}>
        <Row>
          <Icon name="shell" size={28} color={theme.lightInk} />
          <Txt size={17} weight="700">
            Ganaste un caracol por participar.
          </Txt>
        </Row>
        {summary.newPage && (
          <Txt size={16}>
            Recuperaste una página de la historia: “{summary.newPage}”
          </Txt>
        )}
        {summary.newReward && <Txt size={16}>¡Nuevo accesorio en tu ropero: {summary.newReward}!</Txt>}
      </Card>
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
  const { current, endSession, reset, back } = useStore();
  const [closed, setClosed] = useState(false);
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
            endSession();
            setClosed(true);
          }}
        />
        <Btn label="Seguir jugando" kind="secondary" onPress={back} />
      </Screen>
    );
  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 30 }}>
        <Lumi size={150} mood="celebra" />
      </View>
      <GuideBubble size={0} text={GUIDE_LINES.goodbye(p.alias)} />
      <Btn label="Elegir perfil" big onPress={() => reset({ name: 'profiles' })} />
    </Screen>
  );
}
