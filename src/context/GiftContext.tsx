/**
 * ============================================================================
 * ARCHIVO: src/context/GiftContext.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el núcleo de estado reactivo global de la aplicación. Implementa el patrón
 * React Context (`GiftContext`), su proveedor (`GiftProvider`) y el hook de acceso (`useGift`).
 * Centraliza la persistencia de progreso, el estado de las reproducciones y el control de audio.
 *
 * ¿QUÉ CONTIENE?
 * 1. `GiftContextValue`: Interfaz que describe todas las propiedades y métodos expuestos:
 *    - `config`: Objeto con la configuración completa del regalo (`GiftConfig`).
 *    - `revealedIds`: Arreglo de IDs de las flores descubiertas por el usuario.
 *    - `listenedIds`: Arreglo de IDs de los mensajes de audio escuchados de forma individual.
 *    - `hasPlayedSequence`: Booleano que indica si se reprodujo el modo de secuencia continua.
 *    - `hasSeenEnvelope`: Si la agasajada ya abrió el sobre de presentación inicial.
 *    - `bgMusicEnabled` y `bgMusicVolume`: Control de la música ambiental de fondo.
 *    - `activeVoiceId` e `isBgMusicDucked`: Identificador del audio sonando y atenuación de volumen.
 *    - Funciones de mutación: `revealParticipant`, `markAsListened`, `setHasPlayedSequence`,
 *      `savePlaybackPosition`, `setBgMusicEnabled`, `resetProgress`, etc.
 *    - Métodos de utilidad: `getParticipant(id)`, `isRevealed(id)`, `isListened(id)`, `resolveAudio(url)`.
 * 2. `GiftProvider`: Componente contenedor que orquesta los estados, sincroniza con `localStorage`
 *    y gestiona la música de fondo con atenuación suave ("ducking") al reproducir voces.
 * 3. `useGift()`: Hook personalizado para consumir el contexto de forma segura y tipada.
 *
 * ¿CÓMO FUNCIONA?
 * - Al cargar la app, lee el progreso guardado en `localStorage` (clave `voces_madre_progress_v2`).
 * - Al escuchar un audio individual en una tarjeta o en el modal, se ejecuta `markAsListened(id)`
 *   y automáticamente se guarda en `listenedIds` y en `revealedIds`.
 * - Al iniciar "Escuchar todas las voces en secuencia", se activa `hasPlayedSequence = true`.
 * - Ambas condiciones (`allListened` y `hasPlayedSequence`) son las que desbloquean el acceso a la Carta Final.
 * - Ducking de audio: Cuando cualquier mensaje de voz familiar se reproduce, `activeVoiceId` se establece
 *   con el ID del participante, lo cual atenúa la música instrumental de fondo a un 25% para que la voz
 *   se escuche con total claridad y calidez.
 *
 * ¿CÓMO CONFIGURAR O PERSONALIZAR?
 * - Si querés reiniciar el avance para probar desde cero: podés ejecutar `localStorage.clear()` en la consola
 *   del navegador o utilizar el método `resetProgress()`.
 * - La versión del almacenamiento se controla con `STORAGE_KEY`. Si hacés cambios estructurales
 *   en los IDs de los participantes, podés cambiar `'voces_madre_progress_v2'` a `_v3` para reiniciar limpio.
 *
 * PRECISIONES TÉCNICAS:
 * - Emplea `useCallback` en todos los despachadores para evitar renderizados innecesarios en componentes hijos.
 * - Incluye manejo defensivo de errores para `localStorage` ante modos incógnito o cuotas excedidas.
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { defaultGiftConfig } from '../config/giftConfig';
import { GiftConfig, Participant, UserProgress } from '../types/gift';
import { getOrSynthesizeAudioUrl } from '../utils/audioSynthesizer';

const STORAGE_KEY = 'voces_madre_progress_v2';

interface GiftContextValue {
  config: GiftConfig;
  revealedIds: string[];
  listenedIds: string[];
  playbackPositions: Record<string, number>;
  hasSeenEnvelope: boolean;
  bgMusicEnabled: boolean;
  bgMusicVolume: number;
  storageWarning: string | null;
  activeVoiceId: string | null;
  isBgMusicDucked: boolean;
  hasPlayedSequence: boolean;

  // Actions
  revealParticipant: (id: string) => void;
  markAsListened: (id: string) => void;
  savePlaybackPosition: (id: string, time: number) => void;
  setHasSeenEnvelope: (val: boolean) => void;
  setBgMusicEnabled: (enabled: boolean) => void;
  setBgMusicVolume: (volume: number) => void;
  setActiveVoiceId: (id: string | null) => void;
  setHasPlayedSequence: (val: boolean) => void;
  resetProgress: () => void;

  // Helpers
  getParticipant: (id: string) => Participant | undefined;
  isRevealed: (id: string) => boolean;
  isListened: (id: string) => boolean;
  resolvedAudioUrls: Record<string, string>;
  resolveAudio: (key: string) => Promise<string>;
}

const GiftContext = createContext<GiftContextValue | null>(null);

export const GiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config] = useState<GiftConfig>(defaultGiftConfig);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [listenedIds, setListenedIds] = useState<string[]>([]);
  const [playbackPositions, setPlaybackPositions] = useState<Record<string, number>>({});
  const [hasSeenEnvelope, setHasSeenEnvelopeState] = useState<boolean>(false);
  const [bgMusicEnabled, setBgMusicEnabledState] = useState<boolean>(false);
  const [bgMusicVolume, setBgMusicVolumeState] = useState<number>(0.35);
  const [hasPlayedSequence, setHasPlayedSequenceState] = useState<boolean>(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [activeVoiceId, setActiveVoiceIdState] = useState<string | null>(null);
  const [isBgMusicDucked, setIsBgMusicDucked] = useState<boolean>(false);

  // Cache resolved audio blob URLs
  const [resolvedAudioUrls, setResolvedAudioUrls] = useState<Record<string, string>>({});
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize from localStorage safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: UserProgress = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          const validIds = new Set(config.participants.map((p) => p.id));
          setRevealedIds((parsed.revealedIds || []).filter((id) => validIds.has(id)));
          setListenedIds((parsed.listenedIds || []).filter((id) => validIds.has(id)));
          setPlaybackPositions(parsed.playbackPositions || {});
          setHasSeenEnvelopeState(Boolean(parsed.hasSeenEnvelope));
          setBgMusicEnabledState(Boolean(parsed.bgMusicEnabled));
          setHasPlayedSequenceState(Boolean(parsed.hasPlayedSequence));
          if (typeof parsed.bgMusicVolume === 'number') {
            setBgMusicVolumeState(parsed.bgMusicVolume);
          }
        }
      }
    } catch {
      setStorageWarning(
        'Tu progreso no pudo guardarse en este navegador. Podés seguir disfrutando el regalo, pero quizá no se conserve al cerrar la pestaña.'
      );
    }
  }, [config.participants]);

  // Persist state to localStorage
  const saveToStorage = useCallback(
    (updates: Partial<UserProgress>) => {
      try {
        const currentData: UserProgress = {
          version: 2,
          revealedIds,
          listenedIds,
          playbackPositions,
          hasSeenEnvelope,
          bgMusicEnabled,
          bgMusicVolume,
          hasPlayedSequence,
          lastUpdatedAt: Date.now(),
          ...updates
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
      } catch {
        setStorageWarning('No fue posible guardar el último cambio en la memoria local.');
      }
    },
    [revealedIds, listenedIds, playbackPositions, hasSeenEnvelope, bgMusicEnabled, bgMusicVolume, hasPlayedSequence]
  );

  const revealParticipant = useCallback(
    (id: string) => {
      setRevealedIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        saveToStorage({ revealedIds: next });
        return next;
      });
    },
    [saveToStorage]
  );

  const markAsListened = useCallback(
    (id: string) => {
      setListenedIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        saveToStorage({ listenedIds: next });
        return next;
      });
    },
    [saveToStorage]
  );

  const savePlaybackPosition = useCallback(
    (id: string, time: number) => {
      setPlaybackPositions((prev) => {
        const next = { ...prev, [id]: time };
        saveToStorage({ playbackPositions: next });
        return next;
      });
    },
    [saveToStorage]
  );

  const setHasSeenEnvelope = useCallback(
    (val: boolean) => {
      setHasSeenEnvelopeState(val);
      saveToStorage({ hasSeenEnvelope: val });
    },
    [saveToStorage]
  );

  const setBgMusicEnabled = useCallback(
    (enabled: boolean) => {
      setBgMusicEnabledState(enabled);
      saveToStorage({ bgMusicEnabled: enabled });
    },
    [saveToStorage]
  );

  const setBgMusicVolume = useCallback(
    (vol: number) => {
      setBgMusicVolumeState(vol);
      saveToStorage({ bgMusicVolume: vol });
    },
    [saveToStorage]
  );

  const setActiveVoiceId = useCallback((id: string | null) => {
    setActiveVoiceIdState(id);
    setIsBgMusicDucked(Boolean(id));
  }, []);

  const setHasPlayedSequence = useCallback(
    (val: boolean) => {
      setHasPlayedSequenceState(val);
      saveToStorage({ hasPlayedSequence: val });
    },
    [saveToStorage]
  );

  const resetProgress = useCallback(() => {
    setRevealedIds([]);
    setListenedIds([]);
    setPlaybackPositions({});
    setHasSeenEnvelopeState(false);
    setHasPlayedSequenceState(false);
    setActiveVoiceIdState(null);
    setIsBgMusicDucked(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorar
    }
  }, []);

  const resolveAudio = useCallback(async (audioUrl: string): Promise<string> => {
    if (!audioUrl) return '';
    return getOrSynthesizeAudioUrl(audioUrl);
  }, []);

  // Pre-cargar todos los audios de los participantes para que la reproducción sea instantánea
  useEffect(() => {
    config.participants.forEach((p) => {
      if (p.audioUrl) {
        resolveAudio(p.audioUrl).catch(() => {});
      }
    });
  }, [config.participants, resolveAudio]);

  // Audio de fondo global
  useEffect(() => {
    if (!config.bgMusicUrl) return;

    if (!bgAudioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      bgAudioRef.current = audio;
    }

    const audio = bgAudioRef.current;

    resolveAudio(config.bgMusicUrl).then((src) => {
      if (src && audio.src !== src) {
        audio.src = src;
      }
    });

    const targetVolume = isBgMusicDucked ? bgMusicVolume * 0.15 : bgMusicVolume;
    audio.volume = Math.max(0, Math.min(1, targetVolume));

    if (bgMusicEnabled) {
      audio.play().catch(() => {
        // Autoplay policy prevent
      });
    } else {
      audio.pause();
    }
  }, [config.bgMusicUrl, bgMusicEnabled, bgMusicVolume, isBgMusicDucked, resolveAudio]);

  const getParticipant = useCallback(
    (id: string) => config.participants.find((p) => p.id === id),
    [config.participants]
  );

  const isRevealed = useCallback((id: string) => revealedIds.includes(id), [revealedIds]);
  const isListened = useCallback((id: string) => listenedIds.includes(id), [listenedIds]);

  return (
    <GiftContext.Provider
      value={{
        config,
        revealedIds,
        listenedIds,
        playbackPositions,
        hasSeenEnvelope,
        bgMusicEnabled,
        bgMusicVolume,
        storageWarning,
        activeVoiceId,
        isBgMusicDucked,
        hasPlayedSequence,
        revealParticipant,
        markAsListened,
        savePlaybackPosition,
        setHasSeenEnvelope,
        setBgMusicEnabled,
        setBgMusicVolume,
        setActiveVoiceId,
        setHasPlayedSequence,
        resetProgress,
        getParticipant,
        isRevealed,
        isListened,
        resolvedAudioUrls,
        resolveAudio
      }}
    >
      {children}
    </GiftContext.Provider>
  );
};

export const useGift = () => {
  const context = useContext(GiftContext);
  if (!context) {
    throw new Error('useGift debe ser utilizado dentro de un GiftProvider');
  }
  return context;
};
