// Biblioteca de ilustraciones originales (SVG vectorial, livianas para celulares
// de gama media). Estilo común: contorno azul noche, formas suaves, colores
// cálidos y una sombra en el piso. Cada dibujo ocupa un lienzo de 100×100.
import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

const O = '#2A3350'; // contorno
const sw = 2.6;
const s = { stroke: O, strokeWidth: sw, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const Shadow = ({ y = 90, rx = 30 }: { y?: number; rx?: number }) => <Ellipse cx={50} cy={y} rx={rx} ry={4} fill={O} opacity={0.12} />;
const Eye = ({ x, y, r = 3 }: { x: number; y: number; r?: number }) => (
  <G>
    <Circle cx={x} cy={y} r={r} fill={O} />
    <Circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
  </G>
);
const Smile = ({ x, y, w = 8 }: { x: number; y: number; w?: number }) => <Path d={`M${x - w / 2} ${y} Q${x} ${y + w * 0.6} ${x + w / 2} ${y}`} fill="none" {...s} />;
const Cheek = ({ x, y }: { x: number; y: number }) => <Ellipse cx={x} cy={y} rx={3.5} ry={2.2} fill="#F29A8E" opacity={0.6} />;

type Drawing = () => React.ReactElement;

export const ILLUSTRATIONS: Record<string, Drawing> = {
  // ---------- Cielo y naturaleza ----------
  sol: () => (
    <G>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        return <Line key={i} x1={50 + 26 * Math.cos(a)} y1={48 + 26 * Math.sin(a)} x2={50 + 38 * Math.cos(a)} y2={48 + 38 * Math.sin(a)} {...s} stroke="#E8A020" strokeWidth={5} />;
      })}
      <Circle cx={50} cy={48} r={21} fill="#F7C548" {...s} />
      <Eye x={43} y={45} />
      <Eye x={57} y={45} />
      <Smile x={50} y={53} />
      <Cheek x={38} y={52} />
      <Cheek x={62} y={52} />
    </G>
  ),
  luna: () => (
    <G>
      <Path d="M62 14 A36 36 0 1 0 82 72 A28 28 0 1 1 62 14 Z" fill="#F6E08A" {...s} />
      <Circle cx={40} cy={44} r={3} fill="#E3C65C" />
      <Circle cx={34} cy={60} r={4} fill="#E3C65C" />
      <Eye x={30} y={46} r={2.6} />
      <Smile x={30} y={56} w={7} />
    </G>
  ),
  nube: () => (
    <G>
      <Shadow y={84} rx={26} />
      <Path d="M24 70 Q10 70 12 58 Q14 46 28 48 Q30 30 48 32 Q62 22 72 38 Q90 38 88 56 Q88 70 74 70 Z" fill="#FFFFFF" {...s} />
      <Path d="M30 62 Q50 66 76 62" fill="none" stroke="#D6E3F0" strokeWidth={4} strokeLinecap="round" />
      <Eye x={42} y={52} r={2.6} />
      <Eye x={58} y={52} r={2.6} />
    </G>
  ),
  estrella: () => (
    <G>
      <Shadow />
      <Path d="M50 10 L61 36 L89 38 L67 56 L74 84 L50 69 L26 84 L33 56 L11 38 L39 36 Z" fill="#F7C548" {...s} />
      <Eye x={44} y={48} r={2.6} />
      <Eye x={56} y={48} r={2.6} />
      <Smile x={50} y={56} w={7} />
    </G>
  ),
  mar: () => (
    <G>
      <Rect x={8} y={30} width={84} height={56} rx={14} fill="#7CC3E0" {...s} />
      <Path d="M8 46 Q22 36 36 46 T64 46 T92 46" fill="none" {...s} stroke="#FFFFFF" strokeWidth={4} />
      <Path d="M8 64 Q22 54 36 64 T64 64 T92 64" fill="none" {...s} stroke="#FFFFFF" strokeWidth={4} />
    </G>
  ),
  flor: () => (
    <G>
      <Shadow />
      <Path d="M50 52 L50 88" {...s} stroke="#3E8E5E" strokeWidth={5} />
      <Path d="M50 74 Q36 64 30 72 Q40 80 50 76" fill="#6DBB7F" {...s} />
      {[0, 72, 144, 216, 288].map((a) => (
        <Ellipse key={a} cx={50 + 14 * Math.cos(((a - 90) * Math.PI) / 180)} cy={36 + 14 * Math.sin(((a - 90) * Math.PI) / 180)} rx={10} ry={10} fill="#F28BB0" {...s} />
      ))}
      <Circle cx={50} cy={36} r={9} fill="#F7C548" {...s} />
    </G>
  ),
  rosa: () => (
    <G>
      <Shadow />
      <Path d="M50 50 L50 90" {...s} stroke="#3E8E5E" strokeWidth={5} />
      <Path d="M50 70 Q64 60 70 68 Q60 78 50 74" fill="#6DBB7F" {...s} />
      <Path d="M30 34 Q30 14 50 16 Q70 14 70 34 Q70 52 50 54 Q30 52 30 34 Z" fill="#D9485B" {...s} />
      <Path d="M40 32 Q50 22 60 32 Q56 42 50 40 Q44 42 40 32" fill="#F07085" {...s} />
    </G>
  ),
  arbol: () => (
    <G>
      <Shadow rx={26} />
      <Rect x={43} y={56} width={14} height={32} rx={4} fill="#A9744F" {...s} />
      <Circle cx={50} cy={38} r={28} fill="#5DAE6E" {...s} />
      <Circle cx={36} cy={32} r={4} fill="#E8574F" />
      <Circle cx={62} cy={44} r={4} fill="#E8574F" />
      <Circle cx={54} cy={24} r={4} fill="#E8574F" />
    </G>
  ),
  hoja: () => (
    <G>
      <Shadow rx={20} />
      <Path d="M20 76 Q20 26 80 20 Q78 78 20 76 Z" fill="#7BC47F" {...s} />
      <Path d="M22 74 Q46 50 72 28" fill="none" {...s} />
    </G>
  ),
  lluvia: () => (
    <G>
      <Path d="M22 50 Q8 50 10 40 Q12 28 26 30 Q28 14 46 16 Q60 8 70 22 Q88 22 86 38 Q86 50 72 50 Z" fill="#B9C6D8" {...s} />
      {[28, 46, 64, 38, 56].map((x, i) => (
        <Path key={i} d={`M${x} ${60 + (i % 2) * 12} q-3 6 0 9 q3 -3 0 -9`} fill="#5BA7DB" {...s} strokeWidth={2} />
      ))}
    </G>
  ),
  arcoiris: () => (
    <G>
      {['#E8574F', '#F2A93B', '#F7D54A', '#6DBB7F', '#5B8FD6'].map((c, i) => (
        <Path key={c} d={`M${12 + i * 6} 78 A${38 - i * 6} ${38 - i * 6} 0 0 1 ${88 - i * 6} 78`} fill="none" stroke={c} strokeWidth={6.5} />
      ))}
      <Path d="M6 80 Q4 70 14 70 Q16 62 24 66 Q30 70 26 80 Z" fill="#fff" {...s} />
      <Path d="M94 80 Q96 70 86 70 Q84 62 76 66 Q70 70 74 80 Z" fill="#fff" {...s} />
    </G>
  ),
  isla: () => (
    <G>
      <Ellipse cx={50} cy={82} rx={44} ry={9} fill="#7CC3E0" {...s} />
      <Path d="M18 80 Q50 56 82 80 Z" fill="#F2D29B" {...s} />
      <Path d="M52 74 Q50 50 56 30" fill="none" {...s} stroke="#8A5A3C" strokeWidth={5} />
      <Path d="M56 30 Q40 20 28 32 M56 30 Q70 16 82 28 M56 30 Q46 36 40 48 M56 30 Q70 34 74 46" fill="none" {...s} stroke="#3E8E5E" strokeWidth={5} />
    </G>
  ),
  semilla: () => (
    <G>
      <Path d="M8 70 Q50 58 92 70 L92 90 L8 90 Z" fill="#B98559" {...s} />
      <Ellipse cx={50} cy={58} rx={11} ry={14} fill="#8A5A3C" {...s} transform="rotate(-20 50 58)" />
      <Path d="M46 50 Q52 54 52 64" fill="none" stroke="#C99A6B" strokeWidth={2.5} />
    </G>
  ),
  brote: () => (
    <G>
      <Path d="M8 70 Q50 58 92 70 L92 90 L8 90 Z" fill="#B98559" {...s} />
      <Path d="M50 66 L50 40" {...s} stroke="#3E8E5E" strokeWidth={5} />
      <Path d="M50 46 Q34 30 24 40 Q34 52 50 46" fill="#7BC47F" {...s} />
      <Path d="M50 40 Q64 22 76 32 Q66 46 50 40" fill="#7BC47F" {...s} />
    </G>
  ),
  girasol: () => (
    <G>
      <Path d="M8 76 Q50 66 92 76 L92 92 L8 92 Z" fill="#B98559" {...s} />
      <Path d="M50 74 L50 46" {...s} stroke="#3E8E5E" strokeWidth={5} />
      <Path d="M50 62 Q64 54 70 62 Q60 70 50 66" fill="#7BC47F" {...s} />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i * Math.PI) / 5;
        return <Ellipse key={i} cx={50 + 17 * Math.cos(a)} cy={30 + 17 * Math.sin(a)} rx={7} ry={5} fill="#F7C548" {...s} strokeWidth={2} transform={`rotate(${(i * 36)} ${50 + 17 * Math.cos(a)} ${30 + 17 * Math.sin(a)})`} />;
      })}
      <Circle cx={50} cy={30} r={12} fill="#8A5A3C" {...s} />
    </G>
  ),
  abeja: () => (
    <G>
      <Shadow rx={22} />
      <Ellipse cx={38} cy={34} rx={13} ry={10} fill="#E3F2FB" {...s} transform="rotate(-20 38 34)" />
      <Ellipse cx={60} cy={32} rx={13} ry={10} fill="#E3F2FB" {...s} transform="rotate(20 60 32)" />
      <Ellipse cx={50} cy={58} rx={26} ry={19} fill="#F7C548" {...s} />
      <Path d="M42 40 Q38 58 42 76 M56 40 Q60 58 56 76" fill="none" stroke={O} strokeWidth={6} />
      <Circle cx={74} cy={52} r={11} fill="#F7C548" {...s} />
      <Eye x={77} y={50} r={2.4} />
      <Path d="M24 58 L16 58" {...s} />
    </G>
  ),
  // ---------- Animales ----------
  gato: () => (
    <G>
      <Shadow />
      <Ellipse cx={50} cy={72} rx={24} ry={16} fill="#F2A65A" {...s} />
      <Path d="M74 74 Q90 70 86 52" fill="none" {...s} stroke="#F2A65A" strokeWidth={7} />
      <Path d="M74 74 Q90 70 86 52" fill="none" {...s} strokeWidth={1} />
      <Polygon points="28,30 32,10 44,24" fill="#F2A65A" {...s} />
      <Polygon points="72,30 68,10 56,24" fill="#F2A65A" {...s} />
      <Circle cx={50} cy={38} r={22} fill="#F2A65A" {...s} />
      <Eye x={42} y={36} />
      <Eye x={58} y={36} />
      <Path d="M48 44 L52 44 L50 47 Z" fill="#D9485B" />
      <Path d="M44 48 Q50 53 56 48" fill="none" {...s} />
      <Path d="M30 44 L20 42 M30 48 L20 50 M70 44 L80 42 M70 48 L80 50" {...s} strokeWidth={1.6} />
    </G>
  ),
  pato: () => (
    <G>
      <Shadow />
      <Path d="M22 62 Q22 82 52 84 Q82 84 84 62 Q70 70 52 62 Z" fill="#FFFFFF" {...s} />
      <Circle cx={40} cy={38} r={17} fill="#FFFFFF" {...s} />
      <Path d="M22 38 Q12 40 14 46 Q22 48 26 44 Z" fill="#F2A93B" {...s} />
      <Eye x={36} y={34} />
      <Path d="M50 60 Q66 52 74 64" fill="none" {...s} />
      <Path d="M40 54 Q38 60 32 62" fill="none" {...s} />
    </G>
  ),
  sapo: () => (
    <G>
      <Shadow />
      <Ellipse cx={50} cy={64} rx={32} ry={22} fill="#6DBB7F" {...s} />
      <Circle cx={34} cy={40} r={11} fill="#6DBB7F" {...s} />
      <Circle cx={66} cy={40} r={11} fill="#6DBB7F" {...s} />
      <Eye x={34} y={40} r={4} />
      <Eye x={66} y={40} r={4} />
      <Path d="M32 66 Q50 78 68 66" fill="none" {...s} />
      <Cheek x={30} y={60} />
      <Cheek x={70} y={60} />
    </G>
  ),
  foca: () => (
    <G>
      <Shadow />
      <Path d="M20 84 Q16 50 40 34 Q60 22 66 44 Q74 70 86 80 Q70 88 20 84 Z" fill="#9FB0C2" {...s} />
      <Path d="M78 80 L92 72 L90 86 Z" fill="#9FB0C2" {...s} />
      <Eye x={48} y={40} />
      <Circle cx={60} cy={48} r={3} fill={O} />
      <Path d="M54 52 L64 50 M54 54 L64 56" {...s} strokeWidth={1.4} />
      <Path d="M36 64 Q30 72 40 76" fill="none" {...s} />
    </G>
  ),
  vaca: () => (
    <G>
      <Shadow />
      <Path d="M24 26 L16 18 M76 26 L84 18" {...s} />
      <Ellipse cx={22} cy={34} rx={8} ry={5} fill="#FFFFFF" {...s} />
      <Ellipse cx={78} cy={34} rx={8} ry={5} fill="#FFFFFF" {...s} />
      <Rect x={28} y={20} width={44} height={46} rx={20} fill="#FFFFFF" {...s} />
      <Path d="M30 28 Q40 24 42 36 Q34 40 30 34 Z" fill={O} />
      <Ellipse cx={50} cy={68} rx={20} ry={14} fill="#F4B6B0" {...s} />
      <Circle cx={43} cy={68} r={2.5} fill={O} />
      <Circle cx={57} cy={68} r={2.5} fill={O} />
      <Eye x={41} y={44} />
      <Eye x={59} y={44} />
    </G>
  ),
  mono: () => (
    <G>
      <Shadow />
      <Circle cx={24} cy={42} r={10} fill="#C98B5B" {...s} />
      <Circle cx={76} cy={42} r={10} fill="#C98B5B" {...s} />
      <Circle cx={50} cy={46} r={28} fill="#A86B44" {...s} />
      <Path d="M30 50 Q30 34 42 36 Q50 40 58 36 Q70 34 70 50 Q70 70 50 70 Q30 70 30 50 Z" fill="#F0C9A0" {...s} />
      <Eye x={42} y={46} />
      <Eye x={58} y={46} />
      <Smile x={50} y={58} w={10} />
    </G>
  ),
  oso: () => (
    <G>
      <Shadow />
      <Circle cx={28} cy={26} r={10} fill="#A86B44" {...s} />
      <Circle cx={72} cy={26} r={10} fill="#A86B44" {...s} />
      <Circle cx={50} cy={50} r={30} fill="#A86B44" {...s} />
      <Ellipse cx={50} cy={60} rx={13} ry={10} fill="#E6C29A" {...s} />
      <Ellipse cx={50} cy={56} rx={5} ry={3.5} fill={O} />
      <Eye x={40} y={44} />
      <Eye x={60} y={44} />
    </G>
  ),
  pez: () => (
    <G>
      <Shadow rx={26} />
      <Path d="M70 50 L90 34 L90 66 Z" fill="#F28F4B" {...s} />
      <Ellipse cx={46} cy={50} rx={30} ry={20} fill="#F7A85B" {...s} />
      <Path d="M44 32 Q52 22 60 32" fill="#F28F4B" {...s} />
      <Path d="M50 36 Q46 50 50 64" fill="none" stroke="#F28F4B" strokeWidth={3} />
      <Eye x={30} y={46} r={3.6} />
      <Path d="M18 56 Q22 58 24 56" fill="none" {...s} />
    </G>
  ),
  conejo: () => (
    <G>
      <Shadow />
      <Ellipse cx={38} cy={24} rx={8} ry={20} fill="#F4F0EA" {...s} />
      <Ellipse cx={62} cy={24} rx={8} ry={20} fill="#F4F0EA" {...s} />
      <Ellipse cx={38} cy={24} rx={3.5} ry={13} fill="#F4B6B0" />
      <Ellipse cx={62} cy={24} rx={3.5} ry={13} fill="#F4B6B0" />
      <Circle cx={50} cy={58} r={26} fill="#F4F0EA" {...s} />
      <Eye x={41} y={54} />
      <Eye x={59} y={54} />
      <Path d="M47 62 L53 62 L50 65 Z" fill="#E87A8C" />
      <Path d="M50 65 L50 69 M44 70 Q50 74 56 70" fill="none" {...s} strokeWidth={2} />
      <Cheek x={36} y={64} />
      <Cheek x={64} y={64} />
    </G>
  ),
  ballena: () => (
    <G>
      <Shadow rx={34} />
      <Path d="M48 14 Q46 4 40 6 M48 14 Q50 4 56 6" fill="none" {...s} stroke="#5BA7DB" />
      <Path d="M10 56 Q10 24 48 24 Q84 24 84 54 Q96 40 94 30 Q100 50 88 66 Q74 84 44 82 Q10 80 10 56 Z" fill="#4F86C6" {...s} />
      <Path d="M14 62 Q44 76 80 64 Q72 80 44 80 Q18 78 14 62 Z" fill="#CFE3F5" {...s} />
      <Eye x={30} y={50} r={3.4} />
      <Smile x={26} y={60} w={9} />
    </G>
  ),
  tortuga: () => (
    <G>
      <Shadow rx={34} />
      <Ellipse cx={28} cy={78} rx={8} ry={6} fill="#86C79B" {...s} />
      <Ellipse cx={68} cy={78} rx={8} ry={6} fill="#86C79B" {...s} />
      <Path d="M14 74 Q16 34 50 32 Q84 34 84 74 Z" fill="#3E9C7A" {...s} />
      <Path d="M34 46 L50 40 L66 46 L62 62 L38 62 Z" fill="#62B892" {...s} strokeWidth={2} />
      <Circle cx={88} cy={58} r={11} fill="#86C79B" {...s} />
      <Eye x={91} y={55} r={2.6} />
    </G>
  ),
  caracol: () => (
    <G>
      <Shadow rx={34} />
      <Path d="M10 84 Q12 72 30 72 L84 72 Q92 72 90 84 Z" fill="#E7C08B" {...s} />
      <Path d="M80 74 L82 50 M86 74 L92 52" {...s} />
      <Circle cx={82} cy={48} r={3} fill={O} />
      <Circle cx={92} cy={50} r={3} fill={O} />
      <Circle cx={46} cy={50} r={26} fill="#D98C5F" {...s} />
      <Path d="M46 50 m0 -6 a6 6 0 1 1 -6 6 a12 12 0 1 1 12 12 a18 18 0 1 1 -18 -18" fill="none" {...s} />
    </G>
  ),
  caracolMar: () => (
    <G>
      <Shadow rx={24} />
      <Path d="M50 14 L82 76 Q50 92 18 76 Z" fill="#F4C9B2" {...s} />
      <Path d="M50 14 L36 82 M50 14 L50 86 M50 14 L64 82" fill="none" {...s} strokeWidth={2} />
    </G>
  ),
  mariposa: () => (
    <G>
      <Path d="M48 48 Q20 10 12 30 Q8 50 46 52 Z" fill="#8A63C2" {...s} />
      <Path d="M52 48 Q80 10 88 30 Q92 50 54 52 Z" fill="#8A63C2" {...s} />
      <Path d="M46 54 Q18 60 22 78 Q34 86 48 58 Z" fill="#F28BB0" {...s} />
      <Path d="M54 54 Q82 60 78 78 Q66 86 52 58 Z" fill="#F28BB0" {...s} />
      <Circle cx={28} cy={32} r={5} fill="#F7C548" />
      <Circle cx={72} cy={32} r={5} fill="#F7C548" />
      <Ellipse cx={50} cy={54} rx={5} ry={22} fill={O} />
      <Path d="M48 34 Q42 22 38 20 M52 34 Q58 22 62 20" fill="none" {...s} />
    </G>
  ),
  elefante: () => (
    <G>
      <Shadow rx={32} />
      <Ellipse cx={22} cy={42} rx={16} ry={20} fill="#AEB8C9" {...s} />
      <Ellipse cx={78} cy={42} rx={16} ry={20} fill="#AEB8C9" {...s} />
      <Circle cx={50} cy={44} r={26} fill="#C3CCDA" {...s} />
      <Path d="M44 56 Q42 76 52 84 Q60 88 62 82 Q52 76 56 56" fill="#C3CCDA" {...s} />
      <Eye x={40} y={40} />
      <Eye x={60} y={40} />
      <Cheek x={36} y={50} />
      <Cheek x={64} y={50} />
    </G>
  ),
  cocodrilo: () => (
    <G>
      <Shadow rx={40} />
      <Path d="M6 66 Q6 52 26 50 L60 46 Q90 44 94 58 Q94 66 84 66 L60 66 Q50 76 30 76 Q6 76 6 66 Z" fill="#5DAE6E" {...s} />
      <Path d="M60 58 L94 58" {...s} />
      {[66, 74, 82].map((x) => (
        <Polygon key={x} points={`${x},58 ${x + 3},62 ${x + 6},58`} fill="#fff" {...s} strokeWidth={1.4} />
      ))}
      <Circle cx={58} cy={42} r={7} fill="#5DAE6E" {...s} />
      <Eye x={59} y={41} r={2.6} />
      <Path d="M20 50 l4 -6 l4 6 l4 -6 l4 6" fill="none" {...s} />
    </G>
  ),
  ratón: () => (
    <G>
      <Shadow />
      <Circle cx={28} cy={34} r={15} fill="#B8B4AE" {...s} />
      <Circle cx={72} cy={34} r={15} fill="#B8B4AE" {...s} />
      <Circle cx={28} cy={34} r={8} fill="#F4B6B0" />
      <Circle cx={72} cy={34} r={8} fill="#F4B6B0" />
      <Path d="M24 58 Q24 38 50 38 Q76 38 76 58 Q76 82 50 82 Q24 82 24 58 Z" fill="#CFCBC4" {...s} />
      <Eye x={42} y={56} />
      <Eye x={58} y={56} />
      <Circle cx={50} cy={66} r={3.5} fill="#E87A8C" {...s} strokeWidth={1.5} />
    </G>
  ),
  delfín: () => (
    <G>
      <Path d="M6 82 Q24 74 40 82 T74 82 T96 82" fill="none" {...s} stroke="#5BA7DB" strokeWidth={4} />
      <Path d="M14 66 Q22 30 60 24 Q80 22 88 32 Q78 32 76 38 Q86 50 74 62 Q50 72 28 70 L16 78 Z" fill="#6FA8DC" {...s} />
      <Path d="M52 26 Q56 12 66 10 Q62 20 64 25" fill="#6FA8DC" {...s} />
      <Eye x={74} y={38} r={2.8} />
      <Path d="M80 46 Q84 46 86 44" fill="none" {...s} />
    </G>
  ),
  dinosaurio: () => (
    <G>
      <Shadow rx={34} />
      <Path d="M14 74 Q20 52 42 54 Q52 30 66 22 Q78 16 82 26 Q84 34 74 34 Q66 40 66 56 Q80 60 92 76 Q60 80 14 74 Z" fill="#6DBB7F" {...s} />
      <Rect x={34} y={70} width={8} height={14} rx={3} fill="#6DBB7F" {...s} />
      <Rect x={56} y={70} width={8} height={14} rx={3} fill="#6DBB7F" {...s} />
      <Eye x={76} y={26} r={2.6} />
      <Path d="M44 54 l4 -6 l4 6 l4 -6 l4 6" fill="#F7C548" {...s} strokeWidth={1.6} />
    </G>
  ),
  pollito: () => (
    <G>
      <Shadow rx={22} />
      <Path d="M40 84 L38 92 M58 84 L60 92" {...s} stroke="#E8A020" />
      <Circle cx={50} cy={60} r={24} fill="#F7D54A" {...s} />
      <Path d="M30 60 Q24 52 30 46" fill="#F7D54A" {...s} />
      <Eye x={42} y={54} />
      <Eye x={58} y={54} />
      <Polygon points="46,62 54,62 50,68" fill="#F2A93B" {...s} strokeWidth={1.6} />
      <Path d="M48 36 Q50 30 54 34" fill="none" {...s} />
    </G>
  ),
  gallina: () => (
    <G>
      <Shadow rx={28} />
      <Path d="M22 50 Q20 82 52 84 Q82 84 82 56 Q90 44 84 34 Q74 44 70 52 Q60 40 48 46 Q40 30 30 34 Q20 38 22 50 Z" fill="#FFFFFF" {...s} />
      <Path d="M28 28 Q30 18 36 24 Q38 16 44 24" fill="#E8574F" {...s} />
      <Polygon points="20,40 12,44 20,48" fill="#F2A93B" {...s} />
      <Eye x={30} y={38} r={2.6} />
      <Path d="M24 50 Q22 56 26 58" fill="#E8574F" {...s} strokeWidth={1.6} />
      <Path d="M44 64 Q56 72 68 62" fill="none" {...s} />
    </G>
  ),
  huevo: () => (
    <G>
      <Path d="M14 80 Q50 64 86 80 Q86 92 50 92 Q14 92 14 80 Z" fill="#D8B37A" {...s} />
      <Path d="M50 18 Q72 18 74 52 Q74 80 50 80 Q26 80 26 52 Q28 18 50 18 Z" fill="#FFF7E6" {...s} />
    </G>
  ),
  huevoRoto: () => (
    <G>
      <Path d="M14 80 Q50 64 86 80 Q86 92 50 92 Q14 92 14 80 Z" fill="#D8B37A" {...s} />
      <Path d="M26 52 Q26 80 50 80 Q74 80 74 52 L66 44 L58 54 L50 42 L42 54 L34 44 Z" fill="#FFF7E6" {...s} />
      <Circle cx={50} cy={46} r={12} fill="#F7D54A" {...s} />
      <Eye x={46} y={44} r={2.4} />
      <Eye x={54} y={44} r={2.4} />
      <Path d="M44 22 L40 16 L48 18 Z" fill="#FFF7E6" {...s} />
    </G>
  ),
  // ---------- Comidas ----------
  pan: () => (
    <G>
      <Shadow rx={32} />
      <Path d="M14 66 Q12 36 50 34 Q88 36 86 66 Q86 80 50 80 Q14 80 14 66 Z" fill="#E0A55E" {...s} />
      <Path d="M32 44 L40 60 M48 40 L56 58 M64 42 L70 56" fill="none" {...s} stroke="#B97A35" />
    </G>
  ),
  pera: () => (
    <G>
      <Shadow rx={22} />
      <Path d="M50 18 Q60 18 60 34 Q80 50 74 72 Q68 88 50 88 Q32 88 26 72 Q20 50 40 34 Q40 18 50 18 Z" fill="#B7D66A" {...s} />
      <Path d="M50 18 L52 8" {...s} stroke="#8A5A3C" strokeWidth={4} />
      <Path d="M52 12 Q64 4 70 12 Q60 18 52 12" fill="#6DBB7F" {...s} />
    </G>
  ),
  uva: () => (
    <G>
      <Shadow rx={20} />
      {[
        [40, 34], [60, 34], [30, 50], [50, 50], [70, 50], [40, 66], [60, 66], [50, 80],
      ].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={11} fill="#8A63C2" {...s} />
      ))}
      <Path d="M50 24 L52 12" {...s} stroke="#8A5A3C" strokeWidth={4} />
      <Path d="M52 16 Q66 6 74 16 Q62 24 52 16" fill="#6DBB7F" {...s} />
    </G>
  ),
  manzana: () => (
    <G>
      <Shadow rx={26} />
      <Path d="M50 30 Q30 18 20 38 Q12 62 30 80 Q40 90 50 84 Q60 90 70 80 Q88 62 80 38 Q70 18 50 30 Z" fill="#E8574F" {...s} />
      <Path d="M50 30 L50 16" {...s} stroke="#8A5A3C" strokeWidth={4} />
      <Path d="M52 20 Q64 8 74 16 Q64 26 52 20" fill="#6DBB7F" {...s} />
      <Ellipse cx={34} cy={44} rx={4} ry={7} fill="#fff" opacity={0.5} />
    </G>
  ),
  banana: () => (
    <G>
      <Shadow rx={30} />
      <Path d="M16 30 Q14 72 52 80 Q80 84 88 64 Q60 72 40 56 Q28 44 26 26 Z" fill="#F7D54A" {...s} />
      <Path d="M16 30 L18 22 L26 24 L26 26" fill="#8A5A3C" {...s} />
      <Path d="M30 46 Q44 66 74 70" fill="none" stroke="#E8B820" strokeWidth={2.5} />
    </G>
  ),
  tomate: () => (
    <G>
      <Shadow rx={28} />
      <Circle cx={50} cy={56} r={30} fill="#E8574F" {...s} />
      <Path d="M50 28 L40 22 L46 32 L34 34 L48 38 L50 46 L52 38 L66 34 L54 32 L60 22 Z" fill="#6DBB7F" {...s} strokeWidth={2} />
      <Ellipse cx={36} cy={50} rx={4} ry={7} fill="#fff" opacity={0.45} />
    </G>
  ),
  galleta: () => (
    <G>
      <Shadow rx={28} />
      <Circle cx={50} cy={52} r={32} fill="#D9A35F" {...s} />
      {[
        [38, 40], [60, 36], [48, 56], [66, 60], [34, 64], [54, 72],
      ].map(([x, y], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={4.5} ry={3.5} fill="#6B3E26" />
      ))}
    </G>
  ),
  torta: () => (
    <G>
      <Shadow rx={34} />
      <Rect x={18} y={48} width={64} height={34} rx={6} fill="#F4C9B2" {...s} />
      <Path d="M18 56 Q26 64 34 56 T50 56 T66 56 T82 56 L82 50 Q82 46 78 46 L22 46 Q18 46 18 50 Z" fill="#FFFFFF" {...s} />
      <Rect x={46} y={26} width={8} height={20} rx={2} fill="#5B8FD6" {...s} />
      <Path d="M50 14 Q56 20 50 24 Q44 20 50 14 Z" fill="#F7C548" {...s} strokeWidth={1.8} />
      <Circle cx={30} cy={70} r={3} fill="#E8574F" />
      <Circle cx={70} cy={70} r={3} fill="#E8574F" />
    </G>
  ),
  porcion: () => (
    <G>
      <Ellipse cx={50} cy={80} rx={40} ry={9} fill="#FFFFFF" {...s} />
      <Path d="M22 74 L78 74 L78 52 L22 40 Z" fill="#F4C9B2" {...s} />
      <Path d="M22 40 L78 52 L78 56 Q70 62 62 56 Q52 50 44 52 Q34 52 22 46 Z" fill="#FFFFFF" {...s} />
      <Circle cx={64} cy={44} r={6} fill="#E8574F" {...s} />
    </G>
  ),
  bol: () => (
    <G>
      <Shadow rx={34} />
      <Path d="M14 48 L86 48 Q84 82 50 84 Q16 82 14 48 Z" fill="#7CC3E0" {...s} />
      <Ellipse cx={50} cy={48} rx={36} ry={8} fill="#FFF7E6" {...s} />
      <Path d="M60 48 L84 14" {...s} stroke="#A9744F" strokeWidth={5} />
      <Ellipse cx={58} cy={50} rx={6} ry={3} fill="#E0C48E" />
    </G>
  ),
  horno: () => (
    <G>
      <Shadow rx={34} />
      <Rect x={16} y={20} width={68} height={64} rx={8} fill="#D8DEE8" {...s} />
      <Rect x={24} y={38} width={52} height={36} rx={5} fill="#3B4560" {...s} />
      <Path d="M32 66 Q36 56 40 66 Q44 54 50 66 Q56 56 60 66 Q64 58 68 66" fill="#F2A93B" stroke="#E8574F" strokeWidth={2} />
      <Circle cx={30} cy={29} r={3.5} fill={O} />
      <Circle cx={42} cy={29} r={3.5} fill={O} />
    </G>
  ),
  // ---------- Objetos y lugares ----------
  casa: () => (
    <G>
      <Shadow rx={34} />
      <Rect x={22} y={44} width={56} height={40} rx={3} fill="#F6E3C4" {...s} />
      <Polygon points="14,46 50,16 86,46" fill="#D9705A" {...s} />
      <Rect x={44} y={60} width={14} height={24} rx={2} fill="#A9744F" {...s} />
      <Rect x={28} y={54} width={12} height={12} rx={2} fill="#7CC3E0" {...s} />
      <Rect x={62} y={54} width={12} height={12} rx={2} fill="#7CC3E0" {...s} />
    </G>
  ),
  dado: () => (
    <G>
      <Shadow rx={28} />
      <Path d="M22 34 L50 20 L80 32 L80 70 L52 84 L22 70 Z" fill="#FFFFFF" {...s} />
      <Path d="M22 34 L52 46 L80 32 M52 46 L52 84" fill="none" {...s} />
      <Circle cx={50} cy={32} r={3.2} fill="#D9485B" />
      <Circle cx={30} cy={48} r={3} fill={O} />
      <Circle cx={44} cy={70} r={3} fill={O} />
      <Circle cx={60} cy={56} r={3} fill={O} />
      <Circle cx={72} cy={50} r={3} fill={O} />
      <Circle cx={66} cy={66} r={3} fill={O} />
    </G>
  ),
  lupa: () => (
    <G>
      <Shadow rx={24} />
      <Path d="M60 62 L84 86" {...s} stroke="#A9744F" strokeWidth={10} />
      <Path d="M60 62 L84 86" {...s} strokeWidth={1} />
      <Circle cx={42} cy={42} r={26} fill="#D9ECF7" {...s} strokeWidth={5} />
      <Path d="M28 36 Q32 26 42 24" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
    </G>
  ),
  llave: () => (
    <G>
      <Shadow rx={30} />
      <Circle cx={28} cy={48} r={16} fill="#F7C548" {...s} />
      <Circle cx={28} cy={48} r={6} fill="#FFF8EC" {...s} />
      <Rect x={42} y={43} width={46} height={10} rx={3} fill="#F7C548" {...s} />
      <Rect x={70} y={52} width={7} height={12} rx={2} fill="#F7C548" {...s} />
      <Rect x={80} y={52} width={7} height={9} rx={2} fill="#F7C548" {...s} />
    </G>
  ),
  pelota: () => (
    <G>
      <Shadow rx={26} />
      <Circle cx={50} cy={50} r={32} fill="#FFFFFF" {...s} />
      <Polygon points="50,38 62,46 58,60 42,60 38,46" fill={O} />
      <Path d="M50 38 L50 20 M62 46 L78 40 M58 60 L68 74 M42 60 L32 74 M38 46 L22 40" {...s} />
    </G>
  ),
  camisa: () => (
    <G>
      <Shadow rx={30} />
      <Path d="M36 18 L22 24 L10 42 L22 50 L28 42 L28 86 L72 86 L72 42 L78 50 L90 42 L78 24 L64 18 Q50 30 36 18 Z" fill="#5B8FD6" {...s} />
      <Path d="M50 28 L50 86" fill="none" {...s} strokeWidth={2} />
      <Circle cx={50} cy={46} r={2.4} fill="#fff" />
      <Circle cx={50} cy={62} r={2.4} fill="#fff" />
    </G>
  ),
  zapato: () => (
    <G>
      <Shadow rx={38} />
      <Path d="M12 72 L14 44 Q30 44 36 36 L48 36 Q54 56 76 58 Q92 60 90 76 L12 76 Z" fill="#E8574F" {...s} />
      <Path d="M12 76 L90 76" {...s} strokeWidth={6} stroke="#FFFFFF" />
      <Path d="M12 70 L90 70" {...s} />
      <Path d="M38 44 L46 50 M36 52 L44 56" {...s} stroke="#FFFFFF" />
    </G>
  ),
  nariz: () => (
    <G>
      <Path d="M50 14 Q44 40 34 62 Q28 76 40 80 Q46 82 50 78 Q54 82 60 80 Q72 76 66 62 Q56 40 50 14 Z" fill="#F0C9A0" {...s} />
      <Ellipse cx={42} cy={72} rx={4} ry={2.6} fill={O} />
      <Ellipse cx={58} cy={72} rx={4} ry={2.6} fill={O} />
    </G>
  ),
  luz: () => (
    <G>
      <Path d="M36 64 Q20 52 22 36 Q26 14 50 14 Q74 14 78 36 Q80 52 64 64 Z" fill="#F7D54A" {...s} />
      <Rect x={38} y={64} width={24} height={14} rx={3} fill="#AEB8C9" {...s} />
      <Path d="M44 84 L56 84" {...s} strokeWidth={4} />
    </G>
  ),
  // ---------- Transportes ----------
  tren: () => (
    <G>
      <Shadow rx={38} />
      <Rect x={12} y={40} width={58} height={34} rx={5} fill="#E8574F" {...s} />
      <Rect x={50} y={22} width={30} height={52} rx={5} fill="#5B8FD6" {...s} />
      <Rect x={56} y={30} width={18} height={14} rx={3} fill="#D9ECF7" {...s} />
      <Rect x={20} y={24} width={10} height={16} fill="#3B4560" {...s} />
      <Circle cx={26} cy={78} r={8} fill="#3B4560" {...s} />
      <Circle cx={50} cy={78} r={8} fill="#3B4560" {...s} />
      <Circle cx={72} cy={78} r={8} fill="#3B4560" {...s} />
    </G>
  ),
  auto: () => (
    <G>
      <Shadow rx={38} />
      <Path d="M8 66 L10 52 Q12 46 20 46 L30 32 Q34 28 42 28 L64 28 Q72 28 76 34 L84 46 Q92 48 92 56 L92 66 Z" fill="#E8574F" {...s} />
      <Path d="M34 44 L40 34 L56 34 L56 44 Z M62 44 L62 34 L70 34 L76 44 Z" fill="#D9ECF7" {...s} strokeWidth={2} />
      <Circle cx={28} cy={68} r={10} fill="#3B4560" {...s} />
      <Circle cx={72} cy={68} r={10} fill="#3B4560" {...s} />
      <Circle cx={28} cy={68} r={3.5} fill="#D8DEE8" />
      <Circle cx={72} cy={68} r={3.5} fill="#D8DEE8" />
    </G>
  ),
  moto: () => (
    <G>
      <Shadow rx={38} />
      <Circle cx={24} cy={66} r={14} fill="#3B4560" {...s} />
      <Circle cx={76} cy={66} r={14} fill="#3B4560" {...s} />
      <Circle cx={24} cy={66} r={5} fill="#D8DEE8" />
      <Circle cx={76} cy={66} r={5} fill="#D8DEE8" />
      <Path d="M24 66 L40 46 L64 46 L76 66 M64 46 L70 30 L80 28" fill="none" {...s} strokeWidth={3.5} />
      <Path d="M36 50 Q38 38 52 38 Q62 38 64 50 Z" fill="#F2A93B" {...s} />
      <Path d="M30 40 L48 40" {...s} strokeWidth={5} stroke="#3B4560" />
    </G>
  ),
  barco: () => (
    <G>
      <Path d="M4 84 Q20 76 36 84 T68 84 T96 84" fill="none" {...s} stroke="#5BA7DB" strokeWidth={4} />
      <Path d="M14 66 L86 66 L76 80 L24 80 Z" fill="#D9705A" {...s} />
      <Line x1={50} y1={14} x2={50} y2={66} {...s} strokeWidth={3} />
      <Path d="M52 16 Q80 40 76 60 L52 60 Z" fill="#FFFFFF" {...s} />
      <Path d="M48 24 Q28 44 30 60 L48 60 Z" fill="#F7D54A" {...s} />
    </G>
  ),
  avión: () => (
    <G>
      <Path d="M12 56 Q10 46 22 46 L78 44 Q94 46 94 52 Q94 58 78 58 L22 60 Q12 60 12 56 Z" fill="#FFFFFF" {...s} />
      <Path d="M44 46 L58 18 L66 18 L62 46 Z" fill="#5B8FD6" {...s} />
      <Path d="M44 58 L58 84 L66 84 L62 58 Z" fill="#5B8FD6" {...s} />
      <Path d="M14 48 L8 30 L16 30 L24 46" fill="#5B8FD6" {...s} />
      {[34, 46, 58, 70].map((x) => (
        <Circle key={x} cx={x} cy={51} r={2.6} fill="#7CC3E0" />
      ))}
    </G>
  ),
  bicicleta: () => (
    <G>
      <Shadow rx={40} />
      <Circle cx={24} cy={62} r={16} fill="none" {...s} strokeWidth={4} />
      <Circle cx={76} cy={62} r={16} fill="none" {...s} strokeWidth={4} />
      <Path d="M24 62 L42 40 L66 40 L76 62 M42 40 L52 62 L66 40 M52 62 L24 62" fill="none" {...s} stroke="#2E9BA6" strokeWidth={4} />
      <Path d="M40 34 L48 34 M66 40 L64 28 L72 26" fill="none" {...s} strokeWidth={3.5} />
      <Circle cx={52} cy={62} r={4} fill={O} />
    </G>
  ),
  // ---------- Cuentos ----------
  paraguas: () => (
    <G>
      <Path d="M50 50 L50 82 Q50 90 42 88" fill="none" {...s} strokeWidth={3.5} />
      <Path d="M8 50 Q10 14 50 14 Q90 14 92 50 Q84 42 78 50 Q70 42 64 50 Q56 42 50 50 Q44 42 36 50 Q30 42 22 50 Q16 42 8 50 Z" fill="#8A63C2" {...s} />
      <Path d="M50 14 Q38 30 36 50 M50 14 Q62 30 64 50" fill="none" {...s} strokeWidth={2} />
    </G>
  ),
  puerta: () => (
    <G>
      <Shadow rx={24} />
      <Path d="M26 88 L26 26 Q26 12 50 12 Q74 12 74 26 L74 88 Z" fill="#A9744F" {...s} />
      <Path d="M36 40 L64 40 M36 60 L64 60" {...s} stroke="#8A5A3C" />
      <Circle cx={64} cy={52} r={3.5} fill="#F7C548" {...s} strokeWidth={1.6} />
    </G>
  ),
  libro: () => (
    <G>
      <Shadow rx={36} />
      <Path d="M50 30 Q32 20 12 24 L12 78 Q32 74 50 84 Q68 74 88 78 L88 24 Q68 20 50 30 Z" fill="#FFFFFF" {...s} />
      <Path d="M50 30 L50 84" {...s} />
      <Path d="M20 36 L42 38 M20 46 L42 48 M20 56 L38 58 M58 38 L80 36 M58 48 L80 46 M58 58 L76 56" {...s} strokeWidth={1.8} stroke="#9AA6BD" />
    </G>
  ),
  carta: () => (
    <G>
      <Shadow rx={36} />
      <Rect x={12} y={26} width={76} height={52} rx={6} fill="#FFF7E6" {...s} />
      <Path d="M12 30 L50 58 L88 30" fill="none" {...s} />
      <Circle cx={50} cy={56} r={7} fill="#D9485B" {...s} strokeWidth={2} />
    </G>
  ),
  tele: () => (
    <G>
      <Shadow rx={30} />
      <Path d="M36 20 L48 30 L62 16" fill="none" {...s} />
      <Rect x={14} y={30} width={72} height={50} rx={8} fill="#5B6478" {...s} />
      <Rect x={22} y={38} width={48} height={34} rx={4} fill="#3B4560" {...s} />
      <Circle cx={78} cy={44} r={3} fill="#F7C548" />
    </G>
  ),
  faro: () => (
    <G>
      <Shadow rx={22} />
      <Polygon points="50,16 22,4 78,4" fill="#F7C548" opacity={0.6} />
      <Rect x={40} y={16} width={20} height={12} rx={2} fill="#F7C548" {...s} />
      <Path d="M44 16 Q50 8 56 16" fill={O} />
      <Polygon points="36,28 64,28 60,88 40,88" fill="#FFFFFF" {...s} />
      <Polygon points="38,46 62,46 61,58 39,58" fill="#D9485B" />
      <Polygon points="40,72 60,72 59.5,82 40.5,82" fill="#D9485B" />
    </G>
  ),
  linterna: () => (
    <G>
      <Polygon points="58,40 96,22 96,78 58,60" fill="#F7D54A" opacity={0.5} />
      <Rect x={10} y={40} width={36} height={20} rx={5} fill="#5B8FD6" {...s} />
      <Path d="M46 36 L60 30 L60 70 L46 64 Z" fill="#AEB8C9" {...s} />
      <Rect x={22} y={36} width={8} height={4} rx={1} fill={O} />
    </G>
  ),
  caraContenta: () => (
    <G>
      <Circle cx={50} cy={50} r={36} fill="#F7D54A" {...s} />
      <Eye x={38} y={42} r={4} />
      <Eye x={62} y={42} r={4} />
      <Path d="M32 58 Q50 76 68 58" fill="none" {...s} strokeWidth={3.5} />
      <Cheek x={28} y={56} />
      <Cheek x={72} y={56} />
    </G>
  ),
  caraTriste: () => (
    <G>
      <Circle cx={50} cy={50} r={36} fill="#9EC3E6" {...s} />
      <Eye x={38} y={44} r={4} />
      <Eye x={62} y={44} r={4} />
      <Path d="M34 70 Q50 56 66 70" fill="none" {...s} strokeWidth={3.5} />
      <Path d="M30 52 q-3 6 0 8 q3 -2 0 -8" fill="#5BA7DB" {...s} strokeWidth={1.4} />
    </G>
  ),
  caraEnojada: () => (
    <G>
      <Circle cx={50} cy={50} r={36} fill="#F29A6E" {...s} />
      <Path d="M28 34 L44 40 M72 34 L56 40" {...s} strokeWidth={3.5} />
      <Eye x={38} y={46} r={4} />
      <Eye x={62} y={46} r={4} />
      <Path d="M36 68 L64 68" {...s} strokeWidth={3.5} />
    </G>
  ),
  ancla: () => (
    <G>
      <Shadow rx={26} />
      <Circle cx={50} cy={18} r={7} fill="none" {...s} strokeWidth={4} />
      <Path d="M50 25 L50 82 M34 38 L66 38 M18 60 Q22 84 50 84 Q78 84 82 60" fill="none" {...s} strokeWidth={5} stroke="#5B6478" />
      <Path d="M14 64 L18 56 L24 64 M76 64 L82 56 L86 64" fill="none" {...s} strokeWidth={4} stroke="#5B6478" />
    </G>
  ),
  piedra: () => (
    <G>
      <Path d="M14 78 Q8 56 26 46 Q34 28 56 32 Q80 34 86 56 Q94 76 78 82 Q48 90 14 78 Z" fill="#A7A39B" {...s} />
      <Path d="M36 50 Q44 44 52 48 M60 62 Q68 58 74 64" fill="none" stroke="#C9C5BD" strokeWidth={3} strokeLinecap="round" />
    </G>
  ),
  buzon: () => (
    <G>
      <Shadow rx={20} />
      <Rect x={46} y={52} width={8} height={36} fill="#8A5A3C" {...s} />
      <Path d="M20 54 L20 34 Q20 18 40 18 L60 18 Q80 18 80 34 L80 54 Z" fill="#D9485B" {...s} />
      <Path d="M30 34 L54 34" {...s} strokeWidth={4} />
      <Path d="M80 26 L90 26 L90 36 L80 36" fill="#F7C548" {...s} />
    </G>
  ),
  pasto: () => (
    <G>
      <Rect x={0} y={0} width={100} height={100} fill="#BFE3B0" />
      <Path d="M20 70 l4 -10 l4 10 M60 34 l4 -10 l4 10 M76 80 l3 -8 l3 8" fill="none" stroke="#86C79B" strokeWidth={3} strokeLinecap="round" />
    </G>
  ),
  // ---------- Íconos de actividades ----------
  letras: () => (
    <G>
      <Shadow rx={38} />
      {[
        { x: 12, c: '#E8574F', l: 'M22 74 L30 46 L38 74 M25 64 L35 64' },
        { x: 38, c: '#5B8FD6', l: 'M48 46 L48 74 M48 46 Q62 46 60 54 Q58 60 48 60 Q64 60 62 68 Q60 74 48 74' },
        { x: 64, c: '#6DBB7F', l: 'M86 50 Q80 44 74 48 Q68 54 70 64 Q74 76 86 70' },
      ].map((b) => (
        <G key={b.x}>
          <Rect x={b.x} y={40} width={26} height={40} rx={5} fill={b.c} {...s} />
          <Path d={b.l} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </G>
      ))}
    </G>
  ),
  oreja: () => (
    <G>
      <Path d="M34 70 Q20 40 38 22 Q60 6 74 28 Q82 46 66 58 Q58 64 60 76 Q58 90 44 88 Q36 86 34 70 Z" fill="#F0C9A0" {...s} />
      <Path d="M44 40 Q50 28 60 34 Q66 42 56 50 Q50 56 52 64" fill="none" {...s} />
      <Path d="M82 20 Q90 30 84 42 M88 12 Q100 30 90 50" fill="none" {...s} stroke="#5B8FD6" strokeWidth={3} />
    </G>
  ),
  piezas: () => (
    <G>
      <Shadow rx={34} />
      <Path d="M14 34 L42 34 Q40 26 48 26 Q56 26 54 34 L82 34 L82 58 Q74 56 74 64 Q74 72 82 70 L82 82 L14 82 Z" fill="#F2A93B" {...s} />
      <Path d="M48 34 L48 82" fill="none" {...s} strokeDasharray="4 4" />
    </G>
  ),
  lapiz: () => (
    <G>
      <Shadow rx={34} />
      <Path d="M18 82 L24 64 L70 18 L82 30 L36 76 Z" fill="#F7C548" {...s} />
      <Path d="M18 82 L24 64 L36 76 Z" fill="#F0C9A0" {...s} />
      <Path d="M18 82 L21 73 L27 79 Z" fill={O} />
      <Path d="M64 24 L76 36" {...s} />
      <Path d="M70 18 L76 12 Q80 10 84 14 L88 18 Q90 22 88 24 L82 30" fill="#F28BB0" {...s} />
    </G>
  ),
  nota: () => (
    <G>
      <Shadow rx={30} />
      <Path d="M20 14 L66 14 L80 28 L80 86 L20 86 Z" fill="#FFFFFF" {...s} />
      <Path d="M66 14 L66 28 L80 28" fill="#E3E8F0" {...s} />
      <Path d="M30 40 L70 40 M30 52 L70 52 M30 64 L56 64" {...s} stroke="#9AA6BD" />
      <Path d="M62 70 L74 58 L80 64 L68 76 L60 78 Z" fill="#5B8FD6" {...s} strokeWidth={2} />
    </G>
  ),
  vinetas: () => (
    <G>
      <Rect x={8} y={22} width={26} height={30} rx={4} fill="#FFF7E6" {...s} />
      <Rect x={38} y={22} width={26} height={30} rx={4} fill="#FFF7E6" {...s} />
      <Rect x={68} y={22} width={26} height={30} rx={4} fill="#FFF7E6" {...s} />
      <Circle cx={21} cy={40} r={5} fill="#F7D54A" {...s} strokeWidth={1.6} />
      <Path d="M51 46 L51 32 M45 38 L51 32 L57 38" fill="none" {...s} stroke="#6DBB7F" strokeWidth={3} />
      <Path d="M76 44 L86 44 L81 32 Z" fill="#E8574F" {...s} strokeWidth={1.6} />
      <Path d="M20 70 L30 70 M46 70 L56 70 M74 70 L84 70" {...s} stroke="#9AA6BD" strokeWidth={4} />
      <Circle cx={21} cy={82} r={6} fill="#5B8FD6" />
      <Circle cx={51} cy={82} r={6} fill="#5B8FD6" />
      <Circle cx={81} cy={82} r={6} fill="#5B8FD6" />
    </G>
  ),
  canasta: () => (
    <G>
      <Shadow rx={38} />
      <Path d="M24 48 Q24 18 50 18 Q76 18 76 48" fill="none" {...s} stroke="#A9744F" strokeWidth={5} />
      <Circle cx={36} cy={44} r={9} fill="#E8574F" {...s} />
      <Circle cx={54} cy={40} r={9} fill="#F7D54A" {...s} />
      <Circle cx={68} cy={46} r={8} fill="#8A63C2" {...s} />
      <Path d="M12 48 L88 48 L78 84 L22 84 Z" fill="#D9A35F" {...s} />
      <Path d="M18 60 L82 60 M20 72 L80 72 M38 48 L36 84 M62 48 L64 84" {...s} stroke="#A9744F" strokeWidth={2} />
    </G>
  ),
  farol: () => (
    <G>
      <Shadow rx={22} />
      <Path d="M50 6 L50 16" {...s} />
      <Circle cx={50} cy={50} r={30} fill="#F7D54A" opacity={0.3} />
      <Rect x={34} y={16} width={32} height={8} rx={2} fill="#5B6478" {...s} />
      <Path d="M36 24 L64 24 L60 74 L40 74 Z" fill="#FBE7A1" {...s} />
      <Path d="M50 40 Q58 50 50 60 Q42 50 50 40 Z" fill="#F2A93B" {...s} strokeWidth={1.8} />
      <Rect x={34} y={74} width={32} height={8} rx={2} fill="#5B6478" {...s} />
    </G>
  ),
  naipes: () => (
    <G>
      <Rect x={14} y={24} width={40} height={56} rx={6} fill="#FFFFFF" {...s} transform="rotate(-12 34 52)" />
      <Rect x={44} y={20} width={40} height={56} rx={6} fill="#FFFFFF" {...s} transform="rotate(10 64 48)" />
      <Circle cx={32} cy={54} r={10} fill="#5B8FD6" {...s} />
      <Polygon points="64,34 76,56 52,56" fill="#E8574F" {...s} />
    </G>
  ),
  mapa: () => (
    <G>
      <Shadow rx={38} />
      <Path d="M10 24 L36 16 L64 24 L90 16 L90 78 L64 86 L36 78 L10 86 Z" fill="#F2E2B8" {...s} />
      <Path d="M36 16 L36 78 M64 24 L64 86" {...s} />
      <Path d="M18 66 Q30 48 46 56 T78 36" fill="none" stroke="#D9485B" strokeWidth={3} strokeDasharray="4 4" strokeLinecap="round" />
      <Path d="M74 30 L82 40 M82 30 L74 40" {...s} stroke="#D9485B" strokeWidth={3.5} />
    </G>
  ),
};

export function hasIllustration(key: string) {
  return key in ILLUSTRATIONS;
}

/** Ilustración por clave, en un cuadrado de `size` px. */
export function Illustration({ name, size = 72, label }: { name: string; size?: number; label?: string }) {
  const draw = ILLUSTRATIONS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel={label ?? name} accessible={!!label}>
      {draw ? draw() : <Circle cx={50} cy={50} r={30} fill="#E3D3B5" />}
    </Svg>
  );
}
