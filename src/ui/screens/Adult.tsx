import React, { useMemo, useState } from 'react';
import { Platform, Pressable, Share, View } from 'react-native';
import { Text, TextInput } from '../text';
import { ACTIVITIES, ACTIVITY_IDS, AREA_LABEL } from '../../content/activities';
import { RULES_DESCRIPTION, adultAdjust, MAX_SUPPORT } from '../../domain/adaptation';
import { activityEvidence, attemptsForDisplay, OUTCOME_LABEL, participation, suggestions, writingSummary } from '../../domain/report';
import { HYPOTHESIS_HELP, HYPOTHESIS_LABEL } from '../../domain/writingAnalysis';
import { newId } from '../../domain/profile';
import type { ActivityId, Area, Profile, Settings, WritingHypothesis } from '../../domain/types';
import { hashPin, makeSalt } from '../../storage/repository';
import { speak } from '../../services/voice';
import { Avatar } from '../art';
import { Btn, Card, Row, Screen, Stepper, Toggle, Txt } from '../components';
import { Route, useStore } from '../store';
import { radius } from '../theme';

// ---------------- Puerta parental ----------------
export function GateScreen({ then }: { then: Route }) {
  const { index, replace, back, theme } = useStore();
  const [a] = useState(() => 12 + Math.floor(Math.random() * 30));
  const [b] = useState(() => 13 + Math.floor(Math.random() * 40));
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const usePin = !!index.pinHash;
  const ask = usePin ? 'Ingresá el PIN de adultos' : `Para adultos: escribí el resultado de ${a} + ${b}`;
  const submit = async () => {
    if (usePin) {
      const h = await hashPin(value, index.pinSalt ?? '');
      if (h === index.pinHash) replace(then);
      else setError('PIN incorrecto.');
    } else if (Number(value) === a + b) replace(then);
    else setError('El resultado no es correcto.');
    setValue('');
  };
  return (
    <Screen title="Espacio para adultos" onBack={back}>
      <Card style={{ gap: 10 }}>
        <Txt size={19} weight="700">
          {ask}
        </Txt>
        <Text accessibilityLabel={`Ingresado: ${value.length} dígitos`} style={{ fontSize: 34, fontWeight: '800', textAlign: 'center', color: theme.ink, letterSpacing: 6, minHeight: 44 }}>
          {usePin ? '•'.repeat(value.length) : value}
        </Text>
        {error ? <Txt color={theme.coral} weight="700">{error}</Txt> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].map((k) => (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityLabel={k === '⌫' ? 'Borrar' : k}
              onPress={() => {
                setError('');
                if (k === '⌫') setValue((v) => v.slice(0, -1));
                else if (k === 'OK') submit();
                else setValue((v) => (v + k).slice(0, 6));
              }}
              style={{ width: '30%', height: 60, borderRadius: radius.md, backgroundColor: k === 'OK' ? theme.sea : theme.surface, borderWidth: 2, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 24, fontWeight: '700', color: k === 'OK' ? '#fff' : theme.ink }}>{k}</Text>
            </Pressable>
          ))}
        </View>
      </Card>
      <Txt size={14} color={theme.inkSoft}>
        Esta puerta evita entradas accidentales de los chicos. No es una protección fuerte: un niño que sabe sumar o conoce el PIN puede entrar, y el PIN se guarda solo en este dispositivo (cifrado con SHA-256). Si lo olvidás, se puede quitar reinstalando la app, lo que borra los datos.
      </Txt>
    </Screen>
  );
}

// ---------------- Inicio adultos ----------------
export function AdultHomeScreen() {
  const { profiles, push, reset, index, setIndex, theme } = useStore();
  const [pin, setPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  return (
    <Screen title="Espacio para adultos" onBack={() => reset({ name: 'profiles' })}>
      <Txt size={20} weight="800" accessibilityRole="header">
        Perfiles
      </Txt>
      {profiles.length === 0 && <Txt color={theme.inkSoft}>Todavía no hay perfiles.</Txt>}
      {profiles.map((p) => {
        const part = participation(p);
        return (
          <Card key={p.id} label={`Ver ${p.alias}`} onPress={() => push({ name: 'adultProfile', profileId: p.id })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar {...p.avatar} size={56} />
            <View style={{ flex: 1 }}>
              <Txt size={18} weight="700">
                {p.alias}
              </Txt>
              <Txt size={14} color={theme.inkSoft}>
                {part.sessions} {part.sessions === 1 ? 'sesión' : 'sesiones'} · {part.missions} {part.missions === 1 ? 'misión' : 'misiones'} · {part.samples} escrituras
                {part.lastActivity ? ` · última vez ${new Date(part.lastActivity).toLocaleDateString('es-AR')}` : ''}
              </Txt>
            </View>
          </Card>
        );
      })}
      <Btn label="Agregar perfil" icon="pencil" kind="secondary" onPress={() => push({ name: 'createProfile' })} />

      <Txt size={20} weight="800" accessibilityRole="header">
        PIN de adultos
      </Txt>
      <Card style={{ gap: 8 }}>
        <Txt size={15} color={theme.inkSoft}>
          {index.pinHash ? 'Hay un PIN configurado.' : 'Sin PIN: la puerta pide resolver una suma.'} El PIN es local y sirve para evitar accesos accidentales.
        </Txt>
        <TextInput
          value={pin}
          onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          secureTextEntry
          placeholder="4 a 6 números"
          accessibilityLabel="Nuevo PIN"
          style={{ fontSize: 20, padding: 12, borderRadius: radius.md, borderWidth: 2, borderColor: theme.border, backgroundColor: theme.surface, color: theme.ink }}
        />
        <Row wrap>
          <Btn
            label={index.pinHash ? 'Cambiar PIN' : 'Crear PIN'}
            disabled={pin.length < 4}
            onPress={async () => {
              const salt = makeSalt();
              await setIndex({ ...index, pinSalt: salt, pinHash: await hashPin(pin, salt) });
              setPin('');
              setPinMsg('PIN guardado.');
            }}
            style={{ flex: 1 }}
          />
          {index.pinHash && (
            <Btn
              label="Quitar PIN"
              kind="secondary"
              onPress={async () => {
                await setIndex({ ...index, pinHash: undefined, pinSalt: undefined });
                setPinMsg('PIN quitado.');
              }}
              style={{ flex: 1 }}
            />
          )}
        </Row>
        {pinMsg ? <Txt weight="700" color={theme.ok}>{pinMsg}</Txt> : null}
      </Card>
      <Btn label="Cómo funciona y privacidad" kind="secondary" onPress={() => push({ name: 'about' })} />
      <Btn label="Salir del espacio para adultos" kind="ghost" onPress={() => reset({ name: 'profiles' })} />
    </Screen>
  );
}

// ---------------- Perfil (adultos) ----------------
const TABS = ['Resumen', 'Actividad', 'Escritura', 'Notas', 'Ajustes', 'Datos'] as const;
type Tab = (typeof TABS)[number];

export function AdultProfileScreen({ profileId }: { profileId: string }) {
  const { profiles, back, theme } = useStore();
  const [tab, setTab] = useState<Tab>('Resumen');
  const p = profiles.find((x) => x.id === profileId);
  if (!p)
    return (
      <Screen title="Perfil" onBack={back}>
        <Txt>Este perfil ya no existe.</Txt>
      </Screen>
    );
  return (
    <Screen title={p.alias} onBack={back}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }} accessibilityRole="tablist">
        {TABS.map((t) => (
          <Pressable
            key={t}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
            onPress={() => setTab(t)}
            style={{ paddingHorizontal: 14, minHeight: 48, justifyContent: 'center', borderRadius: 24, backgroundColor: tab === t ? theme.seaDeep : theme.surface, borderWidth: 2, borderColor: tab === t ? theme.seaDeep : theme.border }}
          >
            <Text style={{ color: tab === t ? '#fff' : theme.ink, fontWeight: '700', fontSize: theme.fs(15) }}>{t}</Text>
          </Pressable>
        ))}
      </View>
      {tab === 'Resumen' && <SummaryTab p={p} />}
      {tab === 'Actividad' && <ActivityTab p={p} />}
      {tab === 'Escritura' && <WritingTab p={p} />}
      {tab === 'Notas' && <NotesTab p={p} />}
      {tab === 'Ajustes' && <SettingsTab p={p} />}
      {tab === 'Datos' && <DataTab p={p} />}
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Txt size={19} weight="800" accessibilityRole="header">
        {title}
      </Txt>
      {children}
    </View>
  );
}

const AREAS: Area[] = ['lectura', 'escritura', 'oral', 'cognitivo'];

function SummaryTab({ p }: { p: Profile }) {
  const { theme } = useStore();
  const part = participation(p);
  const w = writingSummary(p);
  return (
    <View style={{ gap: 16 }}>
      <Section title="Participación">
        <Card style={{ gap: 4 }}>
          <Txt size={15} color={theme.inkSoft}>
            Esto muestra cuánto jugó. Completar actividades no equivale a haber aprendido.
          </Txt>
          <Txt>
            {part.sessions} {part.sessions === 1 ? 'sesión' : 'sesiones'} · {part.missions} {part.missions === 1 ? 'misión' : 'misiones'} · {part.attempts} consignas · {part.samples} escrituras guardadas
          </Txt>
          <Txt size={15}>
            Lectura {part.byArea.lectura} · Escritura {part.byArea.escritura} · Oral {part.byArea.oral} · Cognitivo {part.byArea.cognitivo}
          </Txt>
        </Card>
      </Section>
      {p.exploration && (
        <Section title="Exploración inicial">
          <Card style={{ gap: 4 }}>
            <Txt>
              Lectura: resolvió {p.exploration.reading.correct} de {p.exploration.reading.total} tareas presentadas ({p.exploration.reading.skipped} saltadas).
            </Txt>
            <Txt>
              Escritura: {HYPOTHESIS_LABEL[p.exploration.writing.hypothesis]} (confianza {p.exploration.writing.confidence}, {p.exploration.writing.samples} muestras).
            </Txt>
            <Txt size={14} color={theme.inkSoft}>
              Se usó para elegir un punto de partida provisorio. Lectura y escritura se registran por separado.
            </Txt>
          </Card>
        </Section>
      )}
      <Section title="Evidencias por área">
        <Txt size={14} color={theme.inkSoft}>
          Basadas en las últimas consignas del nivel actual. "Sin ayuda" = primer intento sin pistas. La velocidad no se usa como indicador.
        </Txt>
        {AREAS.map((area) => (
          <Card key={area} style={{ gap: 8 }}>
            <Txt size={17} weight="800">
              {AREA_LABEL[area]}
            </Txt>
            {area === 'escritura' && (
              <Txt size={15}>
                Hipótesis de escritura: {HYPOTHESIS_LABEL[w.hypothesis]} ({w.basedOn} muestras, confianza {w.confidence}).
              </Txt>
            )}
            {ACTIVITY_IDS.filter((id) => ACTIVITIES[id].area === area).map((id) => {
              const ev = activityEvidence(p, id);
              return (
                <View key={id} style={{ gap: 2, borderTopWidth: 1, borderColor: theme.border, paddingTop: 6 }}>
                  <Txt size={15} weight="700">
                    {ACTIVITIES[id].title} · nivel {ev.level}/{ACTIVITIES[id].maxLevel}
                    {ev.support ? ` · apoyo ${ev.support}` : ''}
                  </Txt>
                  <Txt size={15} color={ev.kind === 'necesitaAcompanamiento' ? theme.coral : theme.ink}>
                    {ev.statement}
                  </Txt>
                  {ev.hintsUsed > 0 && (
                    <Txt size={14} color={theme.inkSoft}>
                      Pistas usadas en esas consignas: {ev.hintsUsed}. Escuchó el texto: {ev.listened} veces.
                    </Txt>
                  )}
                </View>
              );
            })}
          </Card>
        ))}
      </Section>
      <Section title="Sugerencias para acompañar">
        <Card style={{ gap: 6 }}>
          {suggestions(p).map((s) => (
            <Txt key={s} size={15}>
              • {s}
            </Txt>
          ))}
        </Card>
      </Section>
      <Txt size={13} color={theme.inkSoft}>
        Esta aplicación no realiza diagnósticos. Si hay preocupación por el aprendizaje, consultá con docentes o profesionales.
      </Txt>
    </View>
  );
}

function ActivityTab({ p }: { p: Profile }) {
  const { theme } = useStore();
  const list = attemptsForDisplay(p, 80);
  const rules = [...p.ruleLog].reverse().slice(0, 20);
  return (
    <View style={{ gap: 14 }}>
      <Section title="Cambios de nivel y apoyo">
        {rules.length === 0 && <Txt color={theme.inkSoft}>Todavía no hubo cambios.</Txt>}
        {rules.map((r, k) => (
          <Card key={k} style={{ gap: 2, padding: 10 }}>
            <Txt size={15} weight="700">
              {ACTIVITIES[r.activityId].title}: nivel {r.from.level}→{r.to.level}, apoyo {r.from.support}→{r.to.support}
            </Txt>
            <Txt size={14} color={theme.inkSoft}>
              {new Date(r.at).toLocaleString('es-AR')} · {r.reason}
            </Txt>
          </Card>
        ))}
      </Section>
      <Section title="Consignas realizadas (más recientes)">
        {list.length === 0 && <Txt color={theme.inkSoft}>Todavía no hay actividad.</Txt>}
        {list.map((a) => (
          <Card key={a.id} style={{ gap: 2, padding: 10 }}>
            <Txt size={15} weight="700">
              {ACTIVITIES[a.activityId].title} · {OUTCOME_LABEL[a.outcome]}
              {a.context !== 'mision' ? ` · ${a.context}` : ''}
            </Txt>
            <Txt size={14}>
              Consigna: {a.prompt} · Respuesta: {a.response || '—'}
            </Txt>
            <Txt size={13} color={theme.inkSoft}>
              {new Date(a.at).toLocaleString('es-AR')} · nivel {a.level}, apoyo {a.support} · intentos {a.tries} · pistas {a.hintsUsed} · repitió la consigna {a.instructionRepeats}
              {a.listenedToText ? ' · escuchó el texto' : ''}
            </Txt>
          </Card>
        ))}
      </Section>
    </View>
  );
}

const HYPS: WritingHypothesis[] = ['presilabica', 'silabica', 'silabicoAlfabetica', 'alfabetica', 'sinDatos'];

function WritingTab({ p }: { p: Profile }) {
  const { theme, updateProfile } = useStore();
  const w = writingSummary(p);
  const [note, setNote] = useState(p.adultHypothesis?.note ?? '');
  const [sel, setSel] = useState<WritingHypothesis | null>(p.adultHypothesis?.value ?? null);
  const samples = [...p.samples].reverse();
  return (
    <View style={{ gap: 14 }}>
      <Card style={{ gap: 6, backgroundColor: theme.warnBg }}>
        <Txt size={17} weight="800">
          Hipótesis pedagógica provisoria
        </Txt>
        <Txt>
          {HYPOTHESIS_LABEL[w.hypothesis]} — basada en {w.basedOn} escrituras de palabras, confianza {w.confidence}.
        </Txt>
        <Txt size={15}>{HYPOTHESIS_HELP[w.hypothesis]}</Txt>
        <Txt size={14} color={theme.inkSoft}>
          Es una lectura automática y simplificada de las producciones. Requiere revisión de una docente o psicopedagoga, que puede registrar su propia hipótesis abajo. No es un diagnóstico.
        </Txt>
      </Card>
      <Section title="Hipótesis registrada por un adulto">
        <Row wrap gap={6}>
          {HYPS.map((h) => (
            <Pressable
              key={h}
              accessibilityRole="button"
              accessibilityState={{ selected: sel === h }}
              onPress={() => setSel(h)}
              style={{ paddingHorizontal: 12, minHeight: 44, justifyContent: 'center', borderRadius: 20, borderWidth: 2, borderColor: sel === h ? theme.seaDeep : theme.border, backgroundColor: sel === h ? theme.infoBg : theme.surface }}
            >
              <Txt size={14}>{HYPOTHESIS_LABEL[h].replace('Posible escritura ', '')}</Txt>
            </Pressable>
          ))}
        </Row>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Fundamento u observaciones"
          accessibilityLabel="Fundamento de la hipótesis"
          style={{ minHeight: 70, fontSize: 16, padding: 10, borderRadius: radius.md, borderWidth: 2, borderColor: theme.border, backgroundColor: theme.surface, color: theme.ink }}
        />
        <Btn label="Guardar hipótesis" disabled={!sel} onPress={() => sel && updateProfile(p.id, (x) => ({ ...x, adultHypothesis: { value: sel, note, at: new Date().toISOString() } }))} />
        {p.adultHypothesis && (
          <Txt size={14} color={theme.inkSoft}>
            Última registrada: {HYPOTHESIS_LABEL[p.adultHypothesis.value]} ({new Date(p.adultHypothesis.at).toLocaleDateString('es-AR')})
          </Txt>
        )}
      </Section>
      <Section title={`Muestras guardadas (${samples.length})`}>
        {samples.length === 0 && <Txt color={theme.inkSoft}>Todavía no hay escrituras.</Txt>}
        {samples.map((s) => (
          <Card key={s.id} style={{ gap: 4, padding: 12 }}>
            <Txt size={13} color={theme.inkSoft}>
              {new Date(s.at).toLocaleString('es-AR')} · {s.kind === 'palabra' ? 'Palabra' : s.kind === 'mensaje' ? 'Mensaje' : 'Escritura libre'} · {s.context}
            </Txt>
            {s.target && <Txt size={14}>Dibujo/palabra: {s.target}</Txt>}
            {s.kind !== 'palabra' && <Txt size={14}>Consigna: {s.prompt}</Txt>}
            <Txt size={22} weight="800">
              {s.text}
            </Txt>
            {s.revisedText && (
              <Txt size={16}>
                Revisado: <Text style={{ fontWeight: '800' }}>{s.revisedText}</Text>
              </Txt>
            )}
            {s.analysis && (
              <Txt size={14} color={theme.inkSoft}>
                {HYPOTHESIS_LABEL[s.analysis.hypothesis]}. {s.analysis.evidence.join(' ')}
              </Txt>
            )}
            {s.supportsUsed.length > 0 && (
              <Txt size={13} color={theme.inkSoft}>
                Apoyos: {s.supportsUsed.join(', ')}
              </Txt>
            )}
            {s.revisionChecks && (
              <Txt size={13} color={theme.inkSoft}>
                Revisión marcada: {s.revisionChecks.join(', ')}
              </Txt>
            )}
          </Card>
        ))}
      </Section>
    </View>
  );
}

function NotesTab({ p }: { p: Profile }) {
  const { theme, updateProfile } = useStore();
  const [text, setText] = useState('');
  const [area, setArea] = useState<Area | 'general'>('general');
  return (
    <View style={{ gap: 12 }}>
      <Txt size={15} color={theme.inkSoft}>
        Registrá lo que observás mientras juega (por ejemplo, cómo explica sus elecciones o qué estrategias usa al escribir).
      </Txt>
      <Row wrap gap={6}>
        {(['general', ...AREAS] as const).map((a) => (
          <Pressable
            key={a}
            accessibilityRole="button"
            accessibilityState={{ selected: area === a }}
            onPress={() => setArea(a)}
            style={{ paddingHorizontal: 12, minHeight: 44, justifyContent: 'center', borderRadius: 20, borderWidth: 2, borderColor: area === a ? theme.seaDeep : theme.border, backgroundColor: area === a ? theme.infoBg : theme.surface }}
          >
            <Txt size={14}>{a === 'general' ? 'General' : AREA_LABEL[a]}</Txt>
          </Pressable>
        ))}
      </Row>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        placeholder="Escribí una observación"
        accessibilityLabel="Observación"
        style={{ minHeight: 90, fontSize: 16, padding: 10, borderRadius: radius.md, borderWidth: 2, borderColor: theme.border, backgroundColor: theme.surface, color: theme.ink }}
      />
      <Btn
        label="Guardar observación"
        disabled={!text.trim()}
        onPress={() => {
          updateProfile(p.id, (x) => ({ ...x, observations: [...x.observations, { id: newId(), at: new Date().toISOString(), area, text: text.trim() }] }));
          setText('');
        }}
      />
      {[...p.observations].reverse().map((o) => (
        <Card key={o.id} style={{ gap: 4, padding: 12 }}>
          <Txt size={13} color={theme.inkSoft}>
            {new Date(o.at).toLocaleString('es-AR')} · {o.area === 'general' ? 'General' : AREA_LABEL[o.area]}
          </Txt>
          <Txt size={16}>{o.text}</Txt>
          <Btn label="Borrar" kind="ghost" icon="trash" onPress={() => updateProfile(p.id, (x) => ({ ...x, observations: x.observations.filter((y) => y.id !== o.id) }))} />
        </Card>
      ))}
    </View>
  );
}

function SettingsTab({ p }: { p: Profile }) {
  const { theme, updateProfile } = useStore();
  const set = (patch: Partial<Settings>) => updateProfile(p.id, (x) => ({ ...x, settings: { ...x.settings, ...patch } }));
  const adjust = (id: ActivityId, patch: Parameters<typeof adultAdjust>[2]) =>
    updateProfile(p.id, (x) => {
      const r = adultAdjust(id, x.skills[id], patch);
      return { ...x, skills: { ...x.skills, [id]: r.state }, ruleLog: r.log ? [...x.ruleLog, r.log] : x.ruleLog };
    });
  const s = p.settings;
  return (
    <View style={{ gap: 16 }}>
      <Section title="Voz y audio">
        <Card style={{ gap: 4 }}>
          <Toggle label="Voz de Lumi" value={s.voiceEnabled} onChange={(v) => set({ voiceEnabled: v })} />
          <Toggle label="Leer consignas automáticamente" value={s.autoRead} onChange={(v) => set({ autoRead: v })} help="Si se desactiva, igual se pueden escuchar con el botón Repetir." />
          <Toggle label="Lumi habla menos" value={s.guideBrief} onChange={(v) => set({ guideBrief: v })} help="Solo lee las consignas y las devoluciones; no lee los saludos ni los comentarios del mapa." />
          <Toggle label="Efectos de sonido" value={s.sfx} onChange={(v) => set({ sfx: v })} help="Sonidos breves al encajar una pieza o acertar. La app no tiene música de fondo." />
          <Stepper label="Volumen" value={s.volume} min={0.1} max={1} step={0.1} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => set({ volume: v })} />
          <Stepper label="Velocidad" value={s.rate} min={0.6} max={1.2} step={0.1} format={(v) => `${v.toFixed(1)}×`} onChange={(v) => set({ rate: v })} />
          <Btn label="Probar la voz" icon="speaker" kind="secondary" onPress={() => speak('Hola, soy Lumi. ¿Me escuchás bien?', s)} />
          <Txt size={13} color={theme.inkSoft}>
            Se usa la voz sintetizada del dispositivo (sin internet). Si no hay voz en español instalada, puede sonar con otro acento: en iPhone, Ajustes › Accesibilidad › Contenido leído › Voces.
          </Txt>
        </Card>
      </Section>
      <Section title="Accesibilidad">
        <Card style={{ gap: 4 }}>
          <Toggle label="Reducir movimiento" value={s.reduceMotion} onChange={(v) => set({ reduceMotion: v })} help="Quita saltos, festejos animados y demostraciones con movimiento. También se respeta la preferencia del sistema." />
          <Toggle label="Texto más grande" value={s.largeText} onChange={(v) => set({ largeText: v })} />
          <Toggle label="Contraste alto" value={s.highContrast} onChange={(v) => set({ highContrast: v })} />
          <Toggle
            label="Permitir grabar relatos"
            value={s.recordingAllowed}
            onChange={(v) => set({ recordingAllowed: v })}
            help="Usa el micrófono solo cuando el niño toca Grabar. Las grabaciones no se guardan ni se envían, y no se califican."
          />
        </Card>
      </Section>
      <Section title="Dificultad por actividad">
        <Txt size={14} color={theme.inkSoft}>
          Apoyo: 0 = estándar, 1 = menos opciones y más audio, 2 = modelo visible. "Fijar" detiene los cambios automáticos.
        </Txt>
        {ACTIVITY_IDS.map((id) => {
          const sk = p.skills[id];
          const d = ACTIVITIES[id];
          return (
            <Card key={id} style={{ gap: 2, padding: 12 }}>
              <Txt size={16} weight="800">
                {d.title}
              </Txt>
              <Txt size={13} color={theme.inkSoft}>
                Nivel {sk.level}: {d.levels[sk.level - 1]}
              </Txt>
              <Stepper label="Nivel" value={sk.level} min={1} max={d.maxLevel} onChange={(v) => adjust(id, { level: v })} />
              <Stepper label="Apoyo" value={sk.support} min={0} max={MAX_SUPPORT} onChange={(v) => adjust(id, { support: v })} />
              <Toggle label="Fijar (sin cambios automáticos)" value={sk.lockedByAdult} onChange={(v) => adjust(id, { lockedByAdult: v })} />
              <Toggle label="Actividad disponible" value={sk.enabled} onChange={(v) => adjust(id, { enabled: v })} />
            </Card>
          );
        })}
      </Section>
    </View>
  );
}

function DataTab({ p }: { p: Profile }) {
  const { theme, deleteProfile, reset } = useStore();
  const [confirm, setConfirm] = useState(0);
  const json = useMemo(() => JSON.stringify(p, null, 2), [p]);
  return (
    <View style={{ gap: 14 }}>
      <Card style={{ gap: 6 }}>
        <Txt size={16} weight="700">
          Qué se guarda
        </Txt>
        <Txt size={15}>
          Alias, avatar, respuestas a las consignas (con intentos, pistas y nivel), escrituras, observaciones y ajustes. Todo queda en este dispositivo. No se envía a ningún servidor. No se guardan grabaciones de voz.
        </Txt>
      </Card>
      <Btn
        label="Exportar datos (texto JSON)"
        kind="secondary"
        onPress={() => {
          if (Platform.OS === 'web') {
            try {
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `faro-${p.alias}.json`;
              a.click();
            } catch {}
          } else Share.share({ message: json, title: `Datos de ${p.alias}` });
        }}
      />
      <Card style={{ gap: 8, borderColor: theme.coral }}>
        <Txt size={16} weight="800" color={theme.coral}>
          Eliminar perfil y todos sus datos
        </Txt>
        <Txt size={15}>Se borran definitivamente las respuestas, escrituras y observaciones de {p.alias}. No se puede deshacer.</Txt>
        {confirm === 0 && <Btn label="Eliminar perfil" icon="trash" kind="danger" onPress={() => setConfirm(1)} />}
        {confirm === 1 && (
          <Row wrap>
            <Btn
              label="Sí, eliminar definitivamente"
              kind="danger"
              onPress={async () => {
                await deleteProfile(p.id);
                reset({ name: 'adult' });
              }}
              style={{ flex: 1 }}
            />
            <Btn label="Cancelar" kind="secondary" onPress={() => setConfirm(0)} style={{ flex: 1 }} />
          </Row>
        )}
      </Card>
    </View>
  );
}

// ---------------- Acerca de ----------------
export function AboutScreen() {
  const { back, theme } = useStore();
  return (
    <Screen title="Cómo funciona" onBack={back}>
      <Section title="Reglas de adaptación">
        {RULES_DESCRIPTION.map((r) => (
          <Card key={r.id} style={{ gap: 4, padding: 12 }}>
            <Txt size={16} weight="800">
              {r.title}
            </Txt>
            <Txt size={15}>{r.text}</Txt>
          </Card>
        ))}
      </Section>
      <Section title="Actividades">
        {ACTIVITY_IDS.map((id) => {
          const d = ACTIVITIES[id];
          return (
            <Card key={id} style={{ gap: 3, padding: 12 }}>
              <Txt size={16} weight="800">
                {d.title} ({AREA_LABEL[d.area]})
              </Txt>
              <Txt size={14}>Objetivo: {d.objective}</Txt>
              <Txt size={14}>Consigna: {d.instruction}</Txt>
              <Txt size={14}>Interacción: {d.interaction}</Txt>
              <Txt size={14}>Apoyos: {d.supports}</Txt>
              <Txt size={14}>Devolución: {d.feedback}</Txt>
              <Txt size={14}>Niveles: {d.levels.map((l, i) => `${i + 1}) ${l}`).join(' · ')}</Txt>
              <Txt size={14}>Datos que se guardan: {d.data}</Txt>
            </Card>
          );
        })}
      </Section>
      <Section title="Privacidad y límites">
        <Card style={{ gap: 6 }}>
          <Txt size={15}>• Sin publicidad, compras, chat ni rastreadores. No requiere internet.</Txt>
          <Txt size={15}>• Se usan alias y avatares; no se piden nombres reales, fotos ni ubicación.</Txt>
          <Txt size={15}>• El micrófono solo se usa si un adulto lo habilita; las grabaciones no se guardan.</Txt>
          <Txt size={15}>• No se usa reconocimiento de voz ni se califica la pronunciación.</Txt>
          <Txt size={15}>• Los desafíos cognitivos son juegos: mejorar en ellos no demuestra una mejora cognitiva general.</Txt>
          <Txt size={15}>• Las hipótesis de escritura son orientativas y requieren revisión profesional. La app no diagnostica.</Txt>
          <Txt size={14} color={theme.inkSoft}>
            Versión preliminar. Contenidos e ilustraciones provisorios, a validar con docentes y psicopedagogas.
          </Txt>
        </Card>
      </Section>
    </Screen>
  );
}
