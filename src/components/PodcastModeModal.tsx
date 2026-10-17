/**
 * ============================================================================
 * ARCHIVO: src/components/PodcastModeModal.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el modal de reproducción continua ("Escuchar todas las voces en secuencia").
 * Permite a Jesi escuchar todos los mensajes de su familia de forma hilada, como si
 * fuera una carta sonora ininterrumpida.
 *
 * ¿QUÉ CONTIENE?
 * - `PodcastModeModalProps`:
 *   - `onClose`: Callback para cerrar el reproductor continuo.
 *   - `onOpenFinalLetter`: Callback para navegar a la Carta Final al terminar.
 * - `PodcastModeModal`: Componente modal con controles de reproducción secuencial:
 *   - Botón Play / Pausa general.
 *   - Botones para saltar de familiar (Siguiente / Anterior).
 *   - Visualizador de la foto actual, nombre y progreso dentro de la lista (ej: "Mensaje 2 de 8").
 *   - Pantalla de culminación al terminar la secuencia, invitando a abrir la Carta Final.
 *
 * ¿CÓMO FUNCIONA?
 * - Ordena a todos los participantes cronológicamente según su propiedad `order`.
 * - Al reproducir, registra `setHasPlayedSequence(true)` en el contexto global (`GiftContext`).
 *   Esta es la segunda condición requerida para desbloquear el acceso a la Carta Final.
 * - Al terminar el audio de un participante (`onEnded`), avanza automáticamente al siguiente
 *   sin requerir intervención del usuario.
 * - Si llega al final de todas las voces, presenta un cierre emotivo con botón directo a la Carta Final.
 *
 * ¿CÓMO MODIFICAR O PERSONALIZAR?
 * - Los textos, nombres y audios se configuran en `src/config/giftConfig.ts`.
 * - El orden de reproducción se altera simplemente cambiando el número en el campo `order` de cada participante.
 *
 * PRECISIONES TÉCNICAS:
 * - Cancela de forma limpia los eventos del elemento de audio al desmontar o cerrar el modal.
 * - Sincroniza la atenuación de la música de fondo (`setActiveVoiceId`) para mantener la voz en primer plano.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Participant } from '../types/gift';
import { useGift } from '../context/GiftContext';

interface PodcastModeModalProps {
  onClose: () => void;
  onOpenFinalLetter: () => void;
}

export const PodcastModeModal: React.FC<PodcastModeModalProps> = ({
  onClose,
  onOpenFinalLetter
}) => {
  const {
    config,
    markAsListened,
    setActiveVoiceId,
    setHasPlayedSequence,
    resolveAudio
  } = useGift();

  const playlist: Participant[] = React.useMemo(() => {
    return [...config.participants].sort((a, b) => a.order - b.order);
  }, [config.participants]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [imageError, setImageError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentParticipant = playlist[currentIndex];

  // Configuración y carga del audio actual
  useEffect(() => {
    if (isFinished || !currentParticipant) return;

    setImageError(false);
    setAudioError(null);
    setCurrentTime(0);
    setDuration(currentParticipant.estimatedDuration || 0);

    let isSubscribed = true;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'metadata';

    if (!currentParticipant.audioUrl) {
      setAudioError('Este mensaje no tiene un archivo de audio disponible.');
      return;
    }

    resolveAudio(currentParticipant.audioUrl)
      .then((resolvedSrc) => {
        if (!isSubscribed) return;
        if (!resolvedSrc) {
          setAudioError('No pudimos cargar este audio.');
          return;
        }

        audio.src = resolvedSrc;
        audio.load();

        audio.onloadedmetadata = () => {
          if (!isSubscribed) return;
          setDuration(audio.duration || currentParticipant.estimatedDuration || 0);
          audio
            .play()
            .then(() => {
              if (isSubscribed) {
                setIsPlaying(true);
                setActiveVoiceId(currentParticipant.id);
                setHasPlayedSequence(true);
              }
            })
            .catch(() => {
              if (isSubscribed) {
                setIsPlaying(false);
                setActiveVoiceId(null);
              }
            });
        };

        audio.ontimeupdate = () => {
          if (!isSubscribed) return;
          setCurrentTime(audio.currentTime);
        };

        audio.onended = () => {
          if (!isSubscribed) return;
          markAsListened(currentParticipant.id);

          // Avanzar a la siguiente voz automáticamente
          if (currentIndex < playlist.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setIsPlaying(false);
            setActiveVoiceId(null);
            setIsFinished(true);
            setHasPlayedSequence(true);
          }
        };

        audio.onerror = () => {
          if (!isSubscribed) return;
          setIsPlaying(false);
          setActiveVoiceId(null);
          setAudioError(`No se pudo cargar la voz de ${currentParticipant.name}.`);
        };
      })
      .catch(() => {
        if (!isSubscribed) return;
        setAudioError('Error al preparar la pista.');
      });

    return () => {
      isSubscribed = false;
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      setActiveVoiceId(null);
    };
  }, [currentIndex, currentParticipant, playlist.length, isFinished, resolveAudio, markAsListened, setActiveVoiceId]);

  // Tecla Escape para salir
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (audioRef.current) audioRef.current.pause();
        setActiveVoiceId(null);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, setActiveVoiceId]);

  const togglePlay = () => {
    if (!audioRef.current || audioError) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setActiveVoiceId(null);
    } else {
      setActiveVoiceId(currentParticipant?.id || null);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasPlayedSequence(true);
        })
        .catch(() => setIsPlaying(false));
    }
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (audioRef.current) audioRef.current.pause();
    setActiveVoiceId(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#514344]/70 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="podcast-title"
    >
      <div className="relative w-full max-w-lg bg-[#FFFCF9] border border-[#E8DDDA] rounded-3xl p-6 sm:p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#85545D]">
            <Sparkles size={16} className="text-[#8FA58A]" />
            <span id="podcast-title">
              Escucha continua de todas las voces
            </span>
          </div>

          <button
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#514344]/70 hover:text-[#514344] hover:bg-[#FAF5F0] transition-colors cursor-pointer"
            aria-label="Salir de la escucha continua"
          >
            <X size={20} />
          </button>
        </div>

        {!isFinished ? (
          <div>
            {/* Indicador de posición en la lista */}
            <div className="text-xs text-[#8FA58A] font-medium uppercase tracking-widest mb-3">
              Mensaje {currentIndex + 1} de {playlist.length}
            </div>

            {/* Foto del participante actual */}
            <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 mb-4 rounded-full overflow-hidden border-3 border-[#C98291] shadow-md bg-[#FAF5F0]">
              {!imageError && currentParticipant?.photoUrl ? (
                <img
                  src={currentParticipant.photoUrl}
                  alt={currentParticipant.photoAlt || currentParticipant.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#E8C9CB]/40 text-[#85545D] font-serif text-3xl font-bold">
                  {currentParticipant?.name.slice(0, 2)}
                </div>
              )}
              {isPlaying && (
                <div className="absolute inset-0 bg-[#C98291]/15 flex items-center justify-center">
                  <Volume2 size={24} className="text-[#FFFCF9] animate-pulse" />
                </div>
              )}
            </div>

            {/* Nombre y parentesco */}
            <h3 className="font-serif text-3xl font-bold text-[#514344]">
              {currentParticipant?.name}
            </h3>
            <div className="text-sm font-medium text-[#85545D] mt-0.5 mb-3">
              {currentParticipant?.relationship}
            </div>

            {/* Manejo de error si falla la pista */}
            {audioError && (
              <div className="my-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{audioError}</span>
                </div>
                <button
                  onClick={handleNext}
                  className="text-xs font-medium text-rose-900 underline shrink-0 cursor-pointer"
                >
                  Saltar
                </button>
              </div>
            )}

            {/* Barra de progreso */}
            <div className="space-y-1 my-3">
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-[#E8DDDA] rounded-lg appearance-none cursor-pointer accent-[#C98291]"
                aria-label="Progreso del mensaje actual"
              />
              <div className="flex justify-between text-xs text-[#514344]/70 font-mono tabular-nums px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controles de transporte */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
              {/* Anterior */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#514344] hover:bg-[#FAF5F0] disabled:opacity-30 cursor-pointer"
                aria-label="Voz anterior"
              >
                <SkipBack size={22} />
              </button>

              {/* Play / Pausa */}
              <button
                onClick={togglePlay}
                disabled={Boolean(audioError)}
                className="min-h-[58px] min-w-[58px] rounded-full bg-[#C98291] hover:bg-[#85545D] text-[#FFFCF9] flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                aria-label={isPlaying ? 'Pausar reproducción continua' : 'Reanudar reproducción'}
              >
                {isPlaying ? <Pause size={26} className="fill-current" /> : <Play size={26} className="fill-current ml-1" />}
              </button>

              {/* Siguiente */}
              <button
                onClick={handleNext}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#514344] hover:bg-[#FAF5F0] cursor-pointer"
                aria-label="Siguiente voz"
              >
                <SkipForward size={22} />
              </button>
            </div>

            <div className="mt-6 pt-3 border-t border-[#FAF5F0] text-xs text-[#514344]/70">
              Al terminar cada audio avanzará automáticamente a la siguiente voz.
            </div>
          </div>
        ) : (
          /* ESTADO FINAL DE LA SECUENCIA */
          <div className="py-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#DCE4D4] text-[#64775B] mx-auto flex items-center justify-center mb-4">
              <Sparkles size={32} />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#514344]">
              ¡Escuchaste todas las voces!
            </h3>

            <p className="text-xs sm:text-sm text-[#514344]/80 max-w-sm mx-auto mt-2 mb-6 leading-relaxed">
              Cada una de estas personas guarda un lugar inmenso para vos en su corazón.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <button
                onClick={() => {
                  handleClose();
                  onOpenFinalLetter();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C98291] hover:bg-[#85545D] text-[#FFFCF9] font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen size={16} />
                <span>Ver la carta final</span>
              </button>

              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-transparent hover:bg-[#FAF5F0] text-[#514344] text-sm font-medium transition-colors cursor-pointer"
              >
                Volver al jardín
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
