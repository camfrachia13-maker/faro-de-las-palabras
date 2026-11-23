import { LETTER_NAMES } from '../content/words';

/**
 * Prepara un texto para la voz sintetizada:
 * - "la letra D" → "la letra de" (nombre de la letra, sin ambigüedad);
 * - palabras en MAYÚSCULAS → minúsculas (algunas voces las deletrean como siglas);
 * - guiones entre sílabas → pausas.
 */
export function toSpeech(text: string): string {
  return text
    .replace(/\b([Ll]etra|[Ll]a|[Uu]na)\s+([A-ZÑ]|LL|CH)(?=[\s.,;:!?¡¿)»]|$)/g, (_m, pre: string, l: string) => `${pre} ${LETTER_NAMES[l.toLowerCase()] ?? l.toLowerCase()}`)
    .replace(/[A-ZÁÉÍÓÚÑÜ]{2,}/g, (m) => m.toLowerCase())
    .replace(/([a-záéíóúñ])-(?=[a-záéíóúñ])/g, '$1... ')
    .replace(/[«»"]/g, '');
}

