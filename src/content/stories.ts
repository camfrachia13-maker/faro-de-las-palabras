// Relatos breves del Bosque de los Cuentos (originales).
export interface StoryQuestion {
  q: string;
  type: 'literal' | 'inferencia';
  options: { id: string; label: string; pic?: string }[];
  correct: string;
  explain: string;
}
export interface Story {
  id: string;
  level: number;
  title: string;
  sentences: string[];
  questions: StoryQuestion[];
}

export const STORIES: Story[] = [
  {
    id: 'foca-pelota',
    level: 1,
    title: 'La foca y la pelota',
    sentences: ['La foca tiene una pelota.', 'La pelota es roja.'],
    questions: [
      {
        q: '¿Qué tiene la foca?',
        type: 'literal',
        options: [
          { id: 'pelota', label: 'Una pelota', pic: '⚽' },
          { id: 'pez', label: 'Un pez', pic: '🐟' },
          { id: 'llave', label: 'Una llave', pic: '🔑' },
        ],
        correct: 'pelota',
        explain: 'El cuento dice: "La foca tiene una pelota".',
      },
    ],
  },
  {
    id: 'pato-lluvia',
    level: 1,
    title: 'El pato y la nube',
    sentences: ['Llega una nube gris.', 'El pato abre su paraguas.'],
    questions: [
      {
        q: '¿Qué abre el pato?',
        type: 'literal',
        options: [
          { id: 'paraguas', label: 'Un paraguas', pic: '☂️' },
          { id: 'puerta', label: 'Una puerta', pic: '🚪' },
          { id: 'libro', label: 'Un libro', pic: '📖' },
        ],
        correct: 'paraguas',
        explain: 'El cuento dice que el pato abre su paraguas.',
      },
      {
        q: '¿Por qué abre el paraguas?',
        type: 'inferencia',
        options: [
          { id: 'lluvia', label: 'Porque va a llover', pic: '🌧️' },
          { id: 'sol', label: 'Porque hace calor', pic: '☀️' },
          { id: 'noche', label: 'Porque es de noche', pic: '🌙' },
        ],
        correct: 'lluvia',
        explain: 'Llegó una nube gris: eso nos ayuda a pensar que va a llover. No lo dice, lo deducimos.',
      },
    ],
  },
  {
    id: 'tito-carta',
    level: 2,
    title: 'La carta de Tito',
    sentences: [
      'Tito camina despacio hasta la casa de Mara.',
      'Lleva una carta en su caparazón.',
      'Mara la abre y sonríe: ¡es una invitación a una fiesta!',
    ],
    questions: [
      {
        q: '¿Qué lleva Tito?',
        type: 'literal',
        options: [
          { id: 'carta', label: 'Una carta', pic: '✉️' },
          { id: 'torta', label: 'Una torta', pic: '🎂' },
          { id: 'flor', label: 'Una flor', pic: '🌸' },
        ],
        correct: 'carta',
        explain: 'Dice que lleva una carta en su caparazón.',
      },
      {
        q: '¿Cómo se siente Mara al leer la carta?',
        type: 'inferencia',
        options: [
          { id: 'contenta', label: 'Contenta', pic: '😊' },
          { id: 'triste', label: 'Triste', pic: '😢' },
          { id: 'enojada', label: 'Enojada', pic: '😠' },
        ],
        correct: 'contenta',
        explain: 'Mara sonríe y la invitan a una fiesta: por eso pensamos que está contenta.',
      },
    ],
  },
  {
    id: 'bruno-lampara',
    level: 2,
    title: 'La lámpara del faro',
    sentences: [
      'Bruno sube la escalera de la torre.',
      'La lámpara del faro está apagada.',
      'Bruno busca una lamparita nueva en su caja de herramientas.',
    ],
    questions: [
      {
        q: '¿Qué está apagado?',
        type: 'literal',
        options: [
          { id: 'lampara', label: 'La lámpara del faro', pic: '💡' },
          { id: 'tele', label: 'La tele', pic: '📺' },
          { id: 'horno', label: 'El horno', pic: '🔥' },
        ],
        correct: 'lampara',
        explain: 'El cuento dice que la lámpara del faro está apagada.',
      },
      {
        q: '¿Para qué busca Bruno una lamparita?',
        type: 'inferencia',
        options: [
          { id: 'arreglar', label: 'Para encender el faro', pic: '🗼' },
          { id: 'jugar', label: 'Para jugar a la pelota', pic: '⚽' },
          { id: 'comer', label: 'Para comer', pic: '🍞' },
        ],
        correct: 'arreglar',
        explain: 'Si la lámpara está apagada y busca una nueva, es para que el faro vuelva a iluminar.',
      },
    ],
  },
  {
    id: 'caracol-carrera',
    level: 3,
    title: 'La carrera del caracol',
    sentences: [
      'En el bosque organizaron una carrera.',
      'El conejo salió corriendo, pero se quedó dormido debajo de un árbol.',
      'El caracol avanzó despacito, sin parar, toda la tarde.',
      'Cuando el conejo se despertó, el caracol ya estaba cruzando la meta.',
    ],
    questions: [
      {
        q: '¿Dónde se quedó dormido el conejo?',
        type: 'literal',
        options: [
          { id: 'arbol', label: 'Debajo de un árbol', pic: '🌳' },
          { id: 'casa', label: 'En su casa', pic: '🏠' },
          { id: 'barco', label: 'En un barco', pic: '⛵' },
        ],
        correct: 'arbol',
        explain: 'El cuento dice "debajo de un árbol".',
      },
      {
        q: '¿Quién ganó la carrera?',
        type: 'inferencia',
        options: [
          { id: 'caracol', label: 'El caracol', pic: '🐌' },
          { id: 'conejo', label: 'El conejo', pic: '🐰' },
          { id: 'nadie', label: 'Nadie', pic: '❔' },
        ],
        correct: 'caracol',
        explain: 'No lo dice con esas palabras, pero el caracol estaba cruzando la meta cuando el conejo despertó.',
      },
      {
        q: '¿Qué crees que aprendió el conejo?',
        type: 'inferencia',
        options: [
          { id: 'constancia', label: 'Que seguir sin parar ayuda', pic: '🐾' },
          { id: 'dormir', label: 'Que dormir siempre es mejor', pic: '😴' },
          { id: 'correr', label: 'Que los caracoles vuelan', pic: '🪽' },
        ],
        correct: 'constancia',
        explain: 'El caracol ganó porque siguió sin parar. Hay otras ideas posibles: contalas en voz alta.',
      },
    ],
  },
  {
    id: 'isla-mapa',
    level: 3,
    title: 'El mapa escondido',
    sentences: [
      'Mara encontró un papel enrollado entre las hojas.',
      'Tenía dibujada una isla con una cruz roja.',
      'Llamó a sus amigos y prepararon una pala y una linterna.',
      'Esa noche salieron en el barco de Tito.',
    ],
    questions: [
      {
        q: '¿Qué había dibujado en el papel?',
        type: 'literal',
        options: [
          { id: 'isla', label: 'Una isla con una cruz', pic: '🏝️' },
          { id: 'gato', label: 'Un gato', pic: '🐱' },
          { id: 'sol', label: 'Un sol', pic: '☀️' },
        ],
        correct: 'isla',
        explain: 'El cuento dice que tenía una isla con una cruz roja.',
      },
      {
        q: '¿Para qué llevaron una linterna?',
        type: 'inferencia',
        options: [
          { id: 'oscuro', label: 'Porque salieron de noche', pic: '🔦' },
          { id: 'comer', label: 'Para comerla', pic: '🍽️' },
          { id: 'nadar', label: 'Para nadar', pic: '🏊' },
        ],
        correct: 'oscuro',
        explain: 'Salieron "esa noche": la linterna sirve para ver en la oscuridad.',
      },
    ],
  },
];
