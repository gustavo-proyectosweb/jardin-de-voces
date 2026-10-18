/**
 * ============================================================================
 * ARCHIVO: src/config/giftConfig.ts
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el centro neurálgico de contenido y configuración de datos de todo el regalo.
 * Aquí se definen todos los textos, nombres, imágenes, dedicatorias, lista de
 * participantes familiares y el contenido de la Carta Final.
 *
 * ¿QUÉ CONTIENE?
 * - `defaultGiftConfig`: Objeto de tipo `GiftConfig` que alimenta el contexto global
 *   (`GiftContext`) con:
 *   1. Datos de la homenajeada: `honoreeName` ('Jesi'), títulos y fechas.
 *   2. Pantalla de Bienvenida: textos de la carta/sobre inicial (`welcomeTitle`, `welcomeBody`, etc.).
 *   3. Pantalla del Jardín: encabezados y descripciones del mapa botánico.
 *   4. Participantes (`participants`): lista con cada familiar, su nombre, foto, audio,
 *      tipo de flor botánica (`peony`, `rose`, etc.) y transcripción del mensaje.
 *   5. Carta Final (`finalLetterTitle`, `finalLetterParagraphs`, `finalLetterSignature`):
 *      el mensaje conjunto familiar que se desbloquea al final.
 *   6. Música de fondo ambiental (`bgMusicTitle`, `bgMusicUrl`).
 *
 * ¿CÓMO FUNCIONA?
 * Este objeto se carga en `GiftContext.tsx` como el estado inicial del regalo. Todos
 * los componentes visuales (`WelcomeScreen`, `GardenMapScreen`, `VoiceNodeCard`,
 * `FinalLetterScreen`, etc.) leen los datos directamente desde aquí a través de `useGift()`.
 *
 * ¿CÓMO MODIFICAR O PERSONALIZAR LOS DATOS?
 * 1. CAMBIAR HOMENAJEADA:
 *    - Cambiá `honoreeName: 'Jesi'` por el nombre que desees.
 * 2. AGREGAR TUS PROPIOS AUDIOS REALES (MP3/WAV/M4A):
 *    - Colocá tus archivos en la carpeta pública `/public/audio/` (por ejemplo `/audio/lucas.mp3`).
 *    - En cada participante, reemplazá `audioUrl: 'demo:lucas'` por `audioUrl: '/audio/lucas.mp3'`.
 *    - La app detectará automáticamente URLs reales y las reproducirá nativamente.
 * 3. AGREGAR FOTOS REALES:
 *    - Podés importar imágenes desde `src/assets/images/` o colocar fotos en `/public/fotos/`
 *      y poner la ruta directa en `photoUrl: '/fotos/lucas.jpg'`.
 * 4. CONFIGURAR LA TRANSCRIPCIÓN DEL AUDIO:
 *    - Cada participante tiene el campo `transcription: '...'`.
 *    - Escribí el texto exacto que dice la persona en su audio.
 *    - Por diseño, la tarjeta de la flor mostrará este texto una vez que Jesi haya escuchado el audio.
 * 5. EDITAR LA CARTA FINAL:
 *    - Modificá las líneas del arreglo `finalLetterParagraphs: [...]` y la firma `finalLetterSignature`.
 *
 * PRECISIONES TÉCNICAS:
 * - El orden en que aparecen las flores en el jardín está determinado por la propiedad `order`.
 * - Cada flor tiene asignado un `botanicalType` que genera la ilustración botánica SVG única.
 * ============================================================================
 */

import { GiftConfig } from '../types/gift';

// Imágenes reales generadas para esta experiencia
import envelopeImg from '../assets/images/imagen-sobre.jpeg'; //imagen de sobre entrada
import familyPhotoImg from '../assets/images/foto-familia.png';
import lucasImg from '../assets/images/portrait_son_lucas_1792140465557.jpg';

import sofiaImg from '../assets/images/portrait_daughter_sofia_1792140466688.jpg';
import marceloImg from '../assets/images/portrait_partner_marcelo_1792140465707.jpg';
import marianaImg from '../assets/images/portrait_sister_mariana_1792140483768.jpg';
import elenaImg from '../assets/images/portrait_mother_elena_1792140483417.jpg';
import claudiaImg from '../assets/images/portrait_friend_claudia_1792140483150.jpg';
import martinImg from '../assets/images/portrait_son_martin_1792140500716.jpg';
import gonzaloImg from '../assets/images/portrait_brother_gonzalo_1792140500715.jpg';


// Imágenes que inician con "foto-"
import caritoImg from '../assets/images/foto-carito.jpeg';
import cinImg from '../assets/images/foto-cin.jpeg';
import familiaImg from '../assets/images/foto-familia.png';
import gustavoImg from '../assets/images/foto-gustavo.jpg';
import ianImg from '../assets/images/foto-ian.jpg';
import mariImg from '../assets/images/foto-mari.jpeg';
import miaImg from '../assets/images/foto-mia.jpg';
import vaneImg from '../assets/images/foto-vane.jpeg';
import benjaImg from '../assets/images/foto-benja.jpg';
import luluImg from '../assets/images/foto-lulu.jpg';
import luquitasImg from '../assets/images/foto-lucas.jpg';

// Archivos de audio
import benjaAudio from '../assets/audio/mensaje-benja.ogg';
import caritoAudio from '../assets/audio/mensaje-carito.ogg';
import cintiaAudio from '../assets/audio/mensaje-cintia.ogg';
import gustavoAudio from '../assets/audio/mensaje-gustavo.ogg';
import ianAudio from '../assets/audio/mensaje-ian.ogg';
import luluAudio from '../assets/audio/mensaje-lulu.ogg';
import luquitasAudio from '../assets/audio/mensaje-luquitas.ogg';
import mariAudio from '../assets/audio/mensaje-mari.ogg';
import miaAudio from '../assets/audio/mensaje-mia.ogg';
import vaneAudio from '../assets/audio/mensaje-vane.ogg';

export const defaultGiftConfig: GiftConfig = {
  productName: 'Voces y Recuerdos',
  productSubtitle: 'Un regalo para el corazón',
  edition: 'Edición especial para el Día de la Madre',
  honoreeName: 'Jesi',
  giftDate: 'Día de la Madre · Octubre 2026',

  envelopeImage: envelopeImg,

  welcomeTitle: 'Un regalo hecho de voces',
  welcomeSubtitle: 'Hay palabras que abrazan incluso cuando no estamos cerca.',
  welcomeBody:
    'Jesi, hoy preparamos algo especial para vos: pequeños mensajes de las personas que te quieren, recuerdos que merecen ser escuchados y voces que siempre van a encontrar el camino hasta tu corazón.',
  welcomeCta: 'Abrir tu regalo',
  welcomeFooterNote: 'Preparado con amor, para Jesi.',

  gardenTitle: 'Un jardín lleno de voces',
  gardenSubtitle: 'Cada flor guarda un mensaje de alguien que te quiere.',
  gardenHelpText: 'Elegí una flor para escuchar la voz de quien te dejó un mensaje.',

  familyPhotoUrl: familyPhotoImg,

  finalLetterTitle: 'Si pudieras escucharte a través de nuestros corazones…',
  finalLetterSubtitle: 'Descubrirías cuánto amor hay en tu historia.',
  finalLetterParagraphs: [
    'Queremos que sepas algo que quizás no te decimos tantas veces como deberíamos.',
    'En cada uno de nuestros recuerdos hay un pedacito de vos. En las cosas que aprendimos, en los abrazos que todavía recordamos, en las palabras que nos acompañan y hasta en esas pequeñas costumbres que, sin darnos cuenta, llevamos con nosotros.',
    'Cada voz que escuchaste hoy es una manera de decirte gracias. Gracias por estar, por acompañarnos, por enseñarnos, por hacernos reír y por formar parte de nuestras vidas de una manera que nadie más podría hacerlo.',
    'No importa cuántos años pasen ni cuántos caminos recorramos. Hay algo que siempre vamos a compartir: nuestra historia con vos.',
    'Por eso reunimos estas voces. Para que puedas volver a ellas cuando quieras sonreír, cuando necesites sentirnos cerca o simplemente cuando tengas ganas de recordar cuánto te queremos.',
    'Este regalo termina acá, pero todo el amor que guarda no tiene final.',
    'Feliz Día de la Madre.'
  ],
  finalLetterSignature: 'Con todo nuestro amor, hoy y siempre.\nTu familia ❤️',

  bgMusicTitle: 'Arpegio de la mañana',
  bgMusicArtist: 'Música instrumental suave',
  bgMusicUrl: 'demo:bg-ambient',

  participants: [
    /*
    {
      id: 'p1-lucas',
      name: 'Lucas',
      relationship: 'Hijo',
      photoUrl: lucasImg,
      photoAlt: 'Retrato cálido de Lucas sonriendo',
      audioUrl: 'demo:lucas',
      transcription: 'Gracias por enseñarme con tu ejemplo que la bondad y la paciencia son la fuerza más grande del mundo. Te amo muchísimo, má.',
      order: 9,
      estimatedDuration: 18,
      botanicalType: 'peony',
      toneDescription: 'Agradecido y entrañable'
    },
    {
      id: 'p2-marcelo',
      name: 'Marcelo',
      relationship: 'Pareja',
      photoUrl: marceloImg,
      photoAlt: 'Retrato de Marcelo con mirada serena y afectuosa',
      audioUrl: 'demo:marcelo',
      transcription: 'Mirarte reír después de tantos años compartidos sigue siendo mi lugar favorito en el mundo. Feliz día, amor.',
      order: 2,
      estimatedDuration: 20,
      botanicalType: 'rose',
      toneDescription: 'Íntimo y sereno'
    },
    {
      id: 'p3-sofia',
      name: 'Sofía',
      relationship: 'Hija',
      photoUrl: sofiaImg,
      photoAlt: 'Retrato de Sofía sonriendo con cariño',
      audioUrl: 'demo:sofia',
      transcription: 'Cada vez que tengo miedo o dudo de mí misma, cierro los ojos y me acuerdo de tu voz diciéndome que puedo. Sos mi mayor inspiración.',
      order: 3,
      estimatedDuration: 19,
      botanicalType: 'camellia',
      toneDescription: 'Dulce y emocionante'
    },
    {
      id: 'p4-martin',
      name: 'Martín',
      relationship: 'Hijo menor',
      photoUrl: martinImg,
      photoAlt: 'Retrato de Martín sonriendo alegremente',
      audioUrl: 'demo:martin',
      transcription: 'Mamá, gracias por hacerme reír hasta en los días difíciles y por ser mi refugio incondicional siempre. ¡Feliz día!',
      order: 4,
      estimatedDuration: 16,
      botanicalType: 'jasmine',
      toneDescription: 'Alegre y cómplice'
    },
    {
      id: 'p5-mariana',
      name: 'Mariana',
      relationship: 'Hermana',
      photoUrl: marianaImg,
      photoAlt: 'Retrato de Mariana sonriendo con ternura',
      audioUrl: 'demo:mariana',
      transcription: 'Qué orgullo inmenso verte convertida en la madre maravillosa que sos. Te admiro con toda mi alma, hermanita querida.',
      order: 5,
      estimatedDuration: 21,
      botanicalType: 'lavender',
      toneDescription: 'Nostálgico y cercano'
    },
    {
      id: 'p6-elena',
      name: 'Elena',
      relationship: 'Mamá',
      photoUrl: elenaImg,
      photoAlt: 'Retrato tierno de Elena con expresión amorosa',
      audioUrl: 'demo:elena',
      transcription: 'Hija mía, verte dar tanto amor a los tuyos es el mayor regalo que la vida me pudo regalar a mí. Te bendigo hoy y siempre.',
      order: 6,
      estimatedDuration: 22,
      botanicalType: 'orchid',
      toneDescription: 'Sabio y profundamente tierno'
    },
    {
      id: 'p7-gonzalo',
      name: 'Gonzalo',
      relationship: 'Hermano',
      photoUrl: gonzaloImg,
      photoAlt: 'Retrato de Gonzalo sonriendo con calidez',
      audioUrl: 'demo:gonzalo',
      transcription: 'Siempre fuiste el pilar de todos nosotros. Que hoy sientas todo el cariño inmenso que te tenemos. ¡Te quiero!',
      order: 7,
      estimatedDuration: 18,
      botanicalType: 'wildflower',
      toneDescription: 'Fraternal y afectuoso'
    },
    {
      id: 'p8-claudia',
      name: 'Claudia',
      relationship: 'Amiga de la vida',
      photoUrl: claudiaImg,
      photoAlt: 'Retrato de Claudia con sonrisa entrañable',
      audioUrl: 'demo:claudia',
      transcription: 'Brindo por nuestras charlas interminables, por acompañarnos en todo y por la mamá increíble que sos. ¡Muy feliz día, amiga!',
      order: 8,
      estimatedDuration: 19,
      botanicalType: 'lily',
      toneDescription: 'Cálido y confidente'
    },*/

    {
      id: 'p1-benja',
      name: 'Benja',
      relationship: 'Sobrino',
      photoUrl: benjaImg,
      photoAlt: 'Retrato cálido de Benja sonriendo',
      audioUrl: benjaAudio,
      transcription: 'Gracias por estar siempre conmigo',
      order: 1,
      estimatedDuration: 7,
      botanicalType: 'peony',
      toneDescription: 'Agradecido y entrañable'
    },
    {
      id: 'p1-luquitas',
      name: 'Luquitas',
      relationship: 'Sobrino',
      photoUrl: luquitasImg,
      photoAlt: 'Retrato cálido de Luquitas sonriendo',
      audioUrl: luquitasAudio,
      transcription: 'Feliz dia tia Jesi, Te quiero mucho',
      order: 2,
      estimatedDuration: 3,
      botanicalType: 'peony',
      toneDescription: 'Agradecido y entrañable'
    },
    {
      id: 'p3-lulu',
      name: 'Lulu',
      relationship: 'Sobrina',
      photoUrl: luluImg,
      photoAlt: 'Retrato cálido de Lulu sonriendo',
      audioUrl: luluAudio,
      transcription: 'Muchas gracias por siempre recibirnos en tu casa con los brazos abiertos',
      order: 3,
      estimatedDuration: 12,
      botanicalType: 'peony',
      toneDescription: 'Alegre y entrañable'
    },
    {
      id: 'p4-cintia',
      name: 'Cintia',
      relationship: 'Hermana',
      photoUrl: cinImg,
      photoAlt: 'Retrato cálido de Cintia sonriendo',
      audioUrl: cintiaAudio,
      transcription: 'Estoy muy orgullosa de la mujer en que te convertiste, en la madre que sos. Te quiero Mucho',
      order: 4,
      estimatedDuration: 50,
      botanicalType: 'peony',
      toneDescription: 'Emotivo y afectuoso'
    },
    {
      id: 'p5-vane',
      name: 'Vane',
      relationship: 'Hermana',
      photoUrl: vaneImg,
      photoAlt: 'Retrato cálido de Vane sonriendo',
      audioUrl: vaneAudio,
      transcription: 'Me siento afortunada de la hermana que sos, de la tia para mis hijos y estoy orgullosa de la mujer en que te convertiste. Te queremos.',
      order: 5,
      estimatedDuration: 138,
      botanicalType: 'peony',
      toneDescription: 'Cálido y emotivo'
    },
    {
      id: 'p6-carito',
      name: 'Carito',
      relationship: 'Hermana',
      photoUrl: caritoImg,
      photoAlt: 'Retrato cálido de Carito sonriendo',
      audioUrl: caritoAudio,
      transcription: 'Admiro mucho la mama que sos, lo presente que estas en la vida de tus hijos. Te amo mucho.',
      order: 6,
      estimatedDuration: 45,
      botanicalType: 'peony',
      toneDescription: 'Cálido y afectuoso'
    },
    {
      id: 'p7-mari',
      name: 'Mari',
      relationship: 'Mamá',
      photoUrl: mariImg,
      photoAlt: 'Retrato cálido de Mari sonriendo',
      audioUrl: mariAudio,
      transcription: 'Es mi deseo que seas muy feliz, te lo mereces, sos una buena hija y estoy orgullosa de vos.',
      order: 7,
      estimatedDuration: 24,
      botanicalType: 'peony',
      toneDescription: 'Cálido y materno'
    },
    {
      id: 'p8-mia',
      name: 'Mía',
      relationship: 'Hija',
      photoUrl: miaImg,
      photoAlt: 'Retrato cálido de Mía sonriendo',
      audioUrl: miaAudio,
      transcription: 'Hola Mama, Te amo, Feliz Dia, Te amamos mucho, Gracias por cuidarme, Besito.',
      order: 8,
      estimatedDuration: 16,
      botanicalType: 'peony',
      toneDescription: 'Tierno y afectuoso'
    },
    {
      id: 'p9-ian',
      name: 'Ian',
      relationship: 'Hijo',
      photoUrl: ianImg,
      photoAlt: 'Retrato cálido de Ian sonriendo',
      audioUrl: ianAudio,
      transcription: 'Feliz dia de la Madre Mama, Te quiero mucho y gracias por ser la mejor mama del mundo.',
      order: 9,
      estimatedDuration: 5,
      botanicalType: 'peony',
      toneDescription: 'Tierno y afectuoso'
    },
    {
      id: 'p10-gustavo',
      name: 'Gustavo',
      relationship: 'Pareja',
      photoUrl: gustavoImg,
      photoAlt: 'Retrato cálido de Gustavo sonriendo',
      audioUrl: gustavoAudio,
      transcription: 'Te queria decir que muchas gracias por todo lo que haces por mi, por Ian, por Mia todos los dias, tu esfuerzo, tu alegria y que esta familia no seria lo mismo sin que tu estes, sos lo mas hermoso que nos pudo haber pasado.',
      order: 10,
      estimatedDuration: 34,
      botanicalType: 'peony',
      toneDescription: 'Agradecido y amoroso'
    }
  ]
};

/*
los datos son de: Vane
relacion: hermana
audio: vaneAudio
orden: 5
foto: foto-vane
duracion estimada: 138
trasncripcion: 
*/