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
  /** Ilustraciones de la escena (claves). */
  art: string[];
  level: number;
  title: string;
  sentences: string[];
  questions: StoryQuestion[];
}

export const STORIES: Story[] = [
  {
    id: 'foca-pelota',
    art: ['foca', 'pelota'],
    level: 1,
    title: 'La foca y la pelota',
    sentences: ['La foca tiene una pelota.', 'La pelota es roja.'],
    questions: [
      {
        q: '¿Qué tiene la foca?',
        type: 'literal',
        options: [
          { id: 'pelota', label: 'Una pelota', pic: 'pelota' },
          { id: 'pez', label: 'Un pez', pic: 'pez' },
          { id: 'llave', label: 'Una llave', pic: 'llave' },
        ],
        correct: 'pelota',
        explain: 'El cuento dice: "La foca tiene una pelota".',
      },
    ],
  },
  {
    id: 'pato-lluvia',
    art: ['pato', 'nube'],
    level: 1,
    title: 'El pato y la nube',
    sentences: ['Llega una nube gris.', 'El pato abre su paraguas.'],
    questions: [
      {
        q: '¿Qué abre el pato?',
        type: 'literal',
        options: [
          { id: 'paraguas', label: 'Un paraguas', pic: 'paraguas' },
          { id: 'puerta', label: 'Una puerta', pic: 'puerta' },
          { id: 'libro', label: 'Un libro', pic: 'libro' },
        ],
        correct: 'paraguas',
        explain: 'El cuento dice que el pato abre su paraguas.',
      },
      {
        q: '¿Por qué abre el paraguas?',
        type: 'inferencia',
        options: [
          { id: 'lluvia', label: 'Porque va a llover', pic: 'lluvia' },
          { id: 'sol', label: 'Porque hace calor', pic: 'sol' },
          { id: 'noche', label: 'Porque es de noche', pic: 'luna' },
        ],
        correct: 'lluvia',
        explain: 'Llegó una nube gris: eso nos ayuda a pensar que va a llover. No lo dice, lo deducimos.',
      },
    ],
  },
  {
    id: 'tito-carta',
    art: ['tortuga', 'carta'],
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
          { id: 'carta', label: 'Una carta', pic: 'carta' },
          { id: 'torta', label: 'Una torta', pic: 'torta' },
          { id: 'flor', label: 'Una flor', pic: 'flor' },
        ],
        correct: 'carta',
        explain: 'Dice que lleva una carta en su caparazón.',
      },
      {
        q: '¿Cómo se siente Mara al leer la carta?',
        type: 'inferencia',
        options: [
          { id: 'contenta', label: 'Contenta', pic: 'caraContenta' },
          { id: 'triste', label: 'Triste', pic: 'caraTriste' },
          { id: 'enojada', label: 'Enojada', pic: 'caraEnojada' },
        ],
        correct: 'contenta',
        explain: 'Mara sonríe y la invitan a una fiesta: por eso pensamos que está contenta.',
      },
    ],
  },
  {
    id: 'bruno-lampara',
    art: ['faro', 'luz'],
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
          { id: 'lampara', label: 'La lámpara del faro', pic: 'luz' },
          { id: 'tele', label: 'La tele', pic: 'tele' },
          { id: 'horno', label: 'El horno', pic: 'horno' },
        ],
        correct: 'lampara',
        explain: 'El cuento dice que la lámpara del faro está apagada.',
      },
      {
        q: '¿Para qué busca Bruno una lamparita?',
        type: 'inferencia',
        options: [
          { id: 'arreglar', label: 'Para encender el faro', pic: 'faro' },
          { id: 'jugar', label: 'Para jugar a la pelota', pic: 'pelota' },
          { id: 'comer', label: 'Para comer', pic: 'pan' },
        ],
        correct: 'arreglar',
        explain: 'Si la lámpara está apagada y busca una nueva, es para que el faro vuelva a iluminar.',
      },
    ],
  },
  {
    id: 'caracol-carrera',
    art: ['caracol', 'conejo'],
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
          { id: 'arbol', label: 'Debajo de un árbol', pic: 'arbol' },
          { id: 'casa', label: 'En su casa', pic: 'casa' },
          { id: 'barco', label: 'En un barco', pic: 'barco' },
        ],
        correct: 'arbol',
        explain: 'El cuento dice "debajo de un árbol".',
      },
      {
        q: '¿Quién ganó la carrera?',
        type: 'inferencia',
        options: [
          { id: 'caracol', label: 'El caracol', pic: 'caracol' },
          { id: 'conejo', label: 'El conejo', pic: 'conejo' },
          { id: 'nadie', label: 'Nadie' },
        ],
        correct: 'caracol',
        explain: 'No lo dice con esas palabras, pero el caracol estaba cruzando la meta cuando el conejo despertó.',
      },
      {
        q: '¿Qué crees que aprendió el conejo?',
        type: 'inferencia',
        options: [
          { id: 'constancia', label: 'Que seguir sin parar ayuda' },
          { id: 'dormir', label: 'Que dormir siempre es mejor' },
          { id: 'correr', label: 'Que los caracoles vuelan' },
        ],
        correct: 'constancia',
        explain: 'El caracol ganó porque siguió sin parar. Hay otras ideas posibles: contalas en voz alta.',
      },
    ],
  },
  {
    id: 'isla-mapa',
    art: ['isla', 'linterna'],
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
          { id: 'isla', label: 'Una isla con una cruz', pic: 'isla' },
          { id: 'gato', label: 'Un gato', pic: 'gato' },
          { id: 'sol', label: 'Un sol', pic: 'sol' },
        ],
        correct: 'isla',
        explain: 'El cuento dice que tenía una isla con una cruz roja.',
      },
      {
        q: '¿Para qué llevaron una linterna?',
        type: 'inferencia',
        options: [
          { id: 'oscuro', label: 'Porque salieron de noche', pic: 'linterna' },
          { id: 'comer', label: 'Para comerla' },
          { id: 'nadar', label: 'Para nadar' },
        ],
        correct: 'oscuro',
        explain: 'Salieron "esa noche": la linterna sirve para ver en la oscuridad.',
      },
    ],
  },
];
