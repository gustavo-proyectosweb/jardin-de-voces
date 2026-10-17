/**
 * ============================================================================
 * ARCHIVO: src/utils/audioSynthesizer.ts
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el motor generador de audio procedural para modo demostración y fallback.
 * Emplea la Web Audio API nativa (`OfflineAudioContext`) para sintetizar pistas
 * de audio WAV reales y válidas directamente en la memoria del navegador.
 *
 * ¿QUÉ CONTIENE?
 * 1. `bufferToWave`: Función utilitaria de bajo nivel que convierte un `AudioBuffer`
 *    de la Web Audio API en un archivo `Blob` codificado con encabezados WAV estándar.
 * 2. `MELODIES`: Diccionario de configuraciones musicales por participante (`demo:lucas`,
 *    `demo:marcelo`, etc.) y para la música de fondo (`demo:bg-ambient`), definiendo:
 *    - Frecuencias armónicas (acordes cálidos, celesta, guitarra o ambiente).
 *    - Tempo, duración en segundos y tipo de timbre.
 * 3. `getOrSynthesizeAudioUrl`: Función principal exportada.
 *    - Si recibe una URL real (ej: `/audio/mensaje.mp3` o `https://...`), la retorna directamente.
 *    - Si recibe una clave `demo:*`, sintetiza el archivo WAV en milisegundos, crea un `blob:`
 *      y lo almacena en caché (`audioBlobCache`).
 *
 * ¿CÓMO FUNCIONA?
 * - Cuando un reproductor (en la card, en el modal o en la secuencia continua) necesita
 *   reproducir un audio, llama a `resolveAudio(participant.audioUrl)`.
 * - Esto asegura que el elemento `<audio>` del navegador reciba un archivo con duración real,
 *   eventos `onLoadedMetadata`, `onTimeUpdate` y `onEnded` completamente funcionales,
 *   sin requerir descargas externas ni fallar por CORS.
 *
 * ¿CÓMO CONFIGURAR O CAMBIAR PARA USAR AUDIOS REALES?
 * - NO necesitas modificar este archivo si usás audios reales de tus familiares.
 * - Simplemente en `src/config/giftConfig.ts`, en cada participante reemplazás:
 *     `audioUrl: 'demo:lucas'`  =>  `audioUrl: '/audio/lucas.mp3'`
 * - La función detectará que la URL no empieza con `demo:` y la reproducirá directamente.
 *
 * PRECISIONES TÉCNICAS:
 * - Emplea `OfflineAudioContext` para renderizado ultra-rápido en background (no bloquea la UI).
 * - La tasa de muestreo es 22050 Hz para minimizar el tamaño en memoria y generar el audio casi instantáneamente.
 * - Las URLs creadas con `URL.createObjectURL` se guardan en el mapa `audioBlobCache` para no sintetizar más de una vez.
 * ============================================================================
 */

// Cache de URLs generadas para evitar recrear blobs
const audioBlobCache = new Map<string, string>();

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function bufferToWave(abuffer: AudioBuffer, totalSteps: number): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = totalSteps * numOfChan * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);
  const channels: Float32Array[] = [];
  let sampleRate = abuffer.sampleRate;
  let offset = 0;
  let pos = 0;

  // Header WAV
  writeString(view, pos, 'RIFF'); pos += 4;
  view.setUint32(pos, length - 8, true); pos += 4;
  writeString(view, pos, 'WAVE'); pos += 4;
  writeString(view, pos, 'fmt '); pos += 4;
  view.setUint32(pos, 16, true); pos += 4; // SubChunk1Size (16 for PCM)
  view.setUint16(pos, 1, true); pos += 2; // AudioFormat (1 for PCM)
  view.setUint16(pos, numOfChan, true); pos += 2;
  view.setUint32(pos, sampleRate, true); pos += 4;
  view.setUint32(pos, sampleRate * 2 * numOfChan, true); pos += 4; // ByteRate
  view.setUint16(pos, numOfChan * 2, true); pos += 2; // BlockAlign
  view.setUint16(pos, 16, true); pos += 2; // BitsPerSample
  writeString(view, pos, 'data'); pos += 4;
  view.setUint32(pos, length - pos - 4, true); pos += 4;

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (offset < totalSteps) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: 'audio/wav' });
}

interface MelodyConfig {
  chords: number[][];
  tempo: number;
  durationSec: number;
  type: 'celeste' | 'guitar' | 'ambient';
}

const MELODIES: Record<string, MelodyConfig> = {
  'demo:lucas': {
    // Tonalidad cálida en F mayor (F, A, C)
    chords: [
      [349.23, 440.0, 523.25, 698.46],
      [261.63, 392.0, 523.25, 659.25],
      [293.66, 349.23, 440.0, 587.33],
      [233.08, 349.23, 466.16, 587.33]
    ],
    tempo: 1.8,
    durationSec: 18,
    type: 'guitar'
  },
  'demo:marcelo': {
    // Tonalidad serena en C mayor íntimo
    chords: [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 440.0],
      [174.61, 261.63, 329.63, 392.0],
      [196.0, 246.94, 293.66, 392.0]
    ],
    tempo: 2.2,
    durationSec: 20,
    type: 'ambient'
  },
  'demo:sofia': {
    // Tonalidad luminosa en G mayor
    chords: [
      [392.0, 493.88, 587.33, 783.99],
      [329.63, 392.0, 493.88, 659.25],
      [261.63, 329.63, 392.0, 523.25],
      [293.66, 369.99, 440.0, 587.33]
    ],
    tempo: 1.7,
    durationSec: 19,
    type: 'celeste'
  },
  'demo:martin': {
    // Tonalidad alegre en D mayor
    chords: [
      [293.66, 369.99, 440.0, 587.33],
      [246.94, 293.66, 369.99, 493.88],
      [196.0, 246.94, 293.66, 392.0],
      [220.0, 277.18, 329.63, 440.0]
    ],
    tempo: 1.5,
    durationSec: 16,
    type: 'guitar'
  },
  'demo:mariana': {
    // Tonalidad nostálgica en A menor
    chords: [
      [220.0, 261.63, 329.63, 440.0],
      [174.61, 220.0, 261.63, 349.23],
      [261.63, 329.63, 392.0, 523.25],
      [196.0, 246.94, 293.66, 392.0]
    ],
    tempo: 2.0,
    durationSec: 21,
    type: 'ambient'
  },
  'demo:elena': {
    // Tonalidad dulce y sabia en E bemol mayor
    chords: [
      [311.13, 392.0, 466.16, 622.25],
      [233.08, 293.66, 349.23, 466.16],
      [261.63, 311.13, 392.0, 523.25],
      [207.65, 261.63, 311.13, 415.3]
    ],
    tempo: 2.3,
    durationSec: 22,
    type: 'celeste'
  },
  'demo:gonzalo': {
    // Tonalidad reconfortante en B bemol
    chords: [
      [233.08, 293.66, 349.23, 466.16],
      [174.61, 220.0, 261.63, 349.23],
      [196.0, 233.08, 293.66, 392.0],
      [155.56, 233.08, 293.66, 349.23]
    ],
    tempo: 1.9,
    durationSec: 18,
    type: 'guitar'
  },
  'demo:claudia': {
    // Tonalidad cercana en C mayor
    chords: [
      [261.63, 329.63, 392.0, 523.25],
      [293.66, 349.23, 440.0, 587.33],
      [329.63, 392.0, 493.88, 659.25],
      [261.63, 329.63, 392.0, 493.88]
    ],
    tempo: 1.8,
    durationSec: 19,
    type: 'celeste'
  },
  'demo:bg-ambient': {
    // Música de fondo ambiental suave (28s loopable)
    chords: [
      [174.61, 261.63, 329.63, 392.0, 523.25],
      [196.0, 246.94, 293.66, 392.0, 493.88],
      [220.0, 261.63, 329.63, 440.0, 523.25],
      [174.61, 220.0, 261.63, 349.23, 440.0]
    ],
    tempo: 3.5,
    durationSec: 28,
    type: 'ambient'
  }
};

/**
 * Sintetiza un archivo de audio WAV en memoria y retorna su URL para <audio src="...">
 */
export async function getOrSynthesizeAudioUrl(audioKey: string): Promise<string> {
  // Si no es un identificador de demo, es una URL externa o local real
  if (!audioKey.startsWith('demo:')) {
    return audioKey;
  }

  if (audioBlobCache.has(audioKey)) {
    return audioBlobCache.get(audioKey)!;
  }

  const config = MELODIES[audioKey] || MELODIES['demo:lucas'];
  const sampleRate = 22050; // Ligero y suave para síntesis rápida
  const duration = config.durationSec;
  const numFrames = sampleRate * duration;

  const OfflineCtx = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!OfflineCtx) {
    return '';
  }

  const ctx = new OfflineCtx(2, numFrames, sampleRate);

  // Reverb simple convolucional sintético / delay suave
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.35, 0);
  masterGain.connect(ctx.destination);

  // Arpegiar las notas de los acordes suavemente
  const chordDuration = config.tempo;
  const totalChords = Math.ceil(duration / chordDuration);

  for (let c = 0; c < totalChords; c++) {
    const chord = config.chords[c % config.chords.length];
    const startTime = c * chordDuration;

    chord.forEach((freq, noteIdx) => {
      const noteTime = startTime + noteIdx * 0.22;
      if (noteTime >= duration - 0.5) return;

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      if (config.type === 'celeste') {
        osc.type = 'sine';
        // Envolvente tipo caja de música con campana suave
        noteGain.gain.setValueAtTime(0.0001, noteTime);
        noteGain.gain.exponentialRampToValueAtTime(0.28, noteTime + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.8);
      } else if (config.type === 'guitar') {
        osc.type = 'triangle';
        // Envolvente tipo cuerda pulsada cálida
        noteGain.gain.setValueAtTime(0.0001, noteTime);
        noteGain.gain.exponentialRampToValueAtTime(0.25, noteTime + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.2);
      } else {
        // Envolvente tipo almohadilla ambiental suave
        osc.type = 'sine';
        noteGain.gain.setValueAtTime(0.0001, noteTime);
        noteGain.gain.exponentialRampToValueAtTime(0.18, noteTime + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 3.0);
      }

      osc.frequency.setValueAtTime(freq, noteTime);
      // Sutil vibrato cálido
      osc.frequency.exponentialRampToValueAtTime(freq * 1.002, noteTime + 1.2);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 3.2);
    });
  }

  // Fade in y Fade out suave al principio y final
  masterGain.gain.setValueAtTime(0.001, 0);
  masterGain.gain.exponentialRampToValueAtTime(0.4, 0.8);
  masterGain.gain.setValueAtTime(0.4, duration - 1.5);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, duration);

  const renderedBuffer = await ctx.startRendering();
  const waveBlob = bufferToWave(renderedBuffer, numFrames);
  const blobUrl = URL.createObjectURL(waveBlob);

  audioBlobCache.set(audioKey, blobUrl);
  return blobUrl;
}
