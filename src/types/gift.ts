/**
 * ============================================================================
 * ARCHIVO: src/types/gift.ts
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el archivo de definiciones de tipos e interfaces de TypeScript para todo el modelo de datos.
 * Garantiza la consistencia estructural del regalo, los participantes, el progreso del usuario
 * y los estados de la aplicación.
 *
 * ¿QUÉ CONTIENE?
 * 1. `BotanicalType`: Unión de tipos literales para las especies botánicas asignables a las flores
 *    ('peony', 'rose', 'camellia', 'jasmine', 'lily', 'orchid', 'lavender', 'wildflower').
 * 2. `Participant`: Modelo de datos para cada familiar / persona que dejó un mensaje de voz:
 *    - `id`: Identificador único (ej: 'p1-lucas').
 *    - `name`: Nombre de la persona (se devela al escuchar o al abrir).
 *    - `relationship`: Vínculo familiar o afectivo (ej: 'Hijo', 'Pareja').
 *    - `photoUrl` y `photoAlt`: Ruta de la fotografía del familiar.
 *    - `audioUrl`: Ruta al audio (URL local o remota, o prefijo 'demo:').
 *    - `transcription`: Transcripción del audio que se visualiza en la card una vez escuchado.
 *    - `order`: Número entero que define la posición en el mapa del jardín.
 *    - `botanicalType`: Especie de flor que ilustra este mensaje.
 * 3. `GiftConfig`: Modelo que agrupa todos los textos, imágenes globales, música de fondo
 *    y la lista completa de `participants`.
 * 4. `UserProgress`: Estructura guardada en `localStorage` para persistir el avance de Jesi:
 *    - `revealedIds`: IDs de las tarjetas abiertas.
 *    - `listenedIds`: IDs de los audios escuchados individualmente.
 *    - `hasPlayedSequence`: Booleano que indica si se reprodujo el modo continuo.
 *    - `bgMusicEnabled` y `bgMusicVolume`: Preferencias de la música ambiental.
 *    - `hasSeenEnvelope`: Si ya abrió el sobre inicial de bienvenida.
 *
 * ¿CÓMO MODIFICAR O CONFIGURAR?
 * - Si agregás una nueva especie botánica en `BotanicalFlower.tsx`, debes incluir su nombre en `BotanicalType`.
 * - Si querés agregar nuevos campos a los participantes (por ejemplo dedicatorias escritas extra),
 *   definilos como propiedades opcionales en la interfaz `Participant`.
 * ============================================================================
 */

export type BotanicalType =
  | 'peony'
  | 'rose'
  | 'camellia'
  | 'jasmine'
  | 'lily'
  | 'orchid'
  | 'lavender'
  | 'wildflower';

export interface Participant {
  id: string;
  name: string;
  relationship: string;
  photoUrl: string;
  photoAlt: string;
  audioUrl: string;
  highlightQuote?: string;
  transcription?: string; // Transcripción del mensaje de voz que se muestra en la tarjeta una vez escuchado
  order: number;
  categoryTag?: string;
  estimatedDuration?: number; // In seconds
  botanicalType: BotanicalType;
  toneDescription?: string;
}

export interface GiftConfig {
  productName: string;
  productSubtitle: string;
  edition: string;
  honoreeName: string;
  giftDate: string;
  envelopeImage: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeBody: string;
  welcomeCta: string;
  welcomeFooterNote: string;
  gardenTitle: string;
  gardenSubtitle: string;
  gardenHelpText: string;
  familyPhotoUrl: string;
  finalLetterTitle: string;
  finalLetterSubtitle: string;
  finalLetterParagraphs: string[];
  finalLetterSignature: string;
  bgMusicTitle: string;
  bgMusicArtist: string;
  bgMusicUrl: string;
  participants: Participant[];
}

export interface UserProgress {
  version: number;
  revealedIds: string[];
  listenedIds: string[];
  playbackPositions: Record<string, number>;
  bgMusicEnabled: boolean;
  bgMusicVolume: number;
  hasSeenEnvelope: boolean;
  hasPlayedSequence?: boolean;
  lastUpdatedAt?: number;
}
