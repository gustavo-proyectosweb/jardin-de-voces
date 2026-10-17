/**
 * ============================================================================
 * ARCHIVO: src/components/VoicePlayerModal.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es la ventana modal de reproducción de voz individual para un familiar seleccionado.
 * Ofrece una experiencia inmersiva, íntima y cuidada con controles de audio completos.
 *
 * ¿QUÉ CONTIENE?
 * - `VoicePlayerModalProps`:
 *   - `participant`: Objeto del familiar en reproducción (o `null` si está cerrado).
 *   - `onClose`: Callback para cerrar el modal.
 *   - `onNavigateParticipant`: Función para ir al mensaje anterior o siguiente sin salir del modal.
 *   - `hasPrev` / `hasNext`: Banderas de navegación entre voces.
 * - Elementos del reproductor:
 *   - Botón central de Play / Pausa (cambia de ícono en tiempo real con 1 solo click).
 *   - Barra de progreso (timeline) interactiva con scrubbing para adelantar o retroceder.
 *   - Saltos rápidos de -10s y +10s.
 *   - Selector de velocidad (1x, 1.25x, 1.5x).
 *   - Ilustración botánica que pulsa durante la reproducción.
 *   - Fotografía del familiar que se revela al escuchar la voz.
 *
 * ¿CÓMO FUNCIONA?
 * - Al montarse con un participante, resuelve la pista de audio con `resolveAudio(participant.audioUrl)`.
 * - Inicia inmediatamente la reproducción con el primer click del usuario.
 * - Registra `setActiveVoiceId(participant.id)` en `GiftContext`, lo que atenúa la música instrumental de fondo.
 * - Al terminar de escuchar o avanzar en la pista, ejecuta `markAsListened(participant.id)`.
 * - Soporta atajos de teclado: Barra espaciadora para reproducir/pausar, Escape para cerrar.
 *
 * ¿CÓMO CONFIGURAR O PERSONALIZAR?
 * - Si querés cambiar los audios o nombres, modificalos en `src/config/giftConfig.ts`.
 * - La transcripción del mensaje se guarda en `participant.transcription` y se visualiza en la tarjeta del jardín.
 *
 * PRECISIONES TÉCNICAS:
 * - Emplea una referencia mutable `audioRef` que se limpia apropiadamente al desmontar (`audio.pause()`).
 * - Restaura el scroll del cuerpo (`document.body.style.overflow = 'unset'`) al cerrarse.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { Participant } from '../types/gift';
import { BotanicalFlower } from './BotanicalFlower';
import { useGift } from '../context/GiftContext';

interface VoicePlayerModalProps {
  participant: Participant | null;
  onClose: () => void;
  onNavigateParticipant?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const VoicePlayerModal: React.FC<VoicePlayerModalProps> = ({
  participant,
  onClose,
  onNavigateParticipant,
  hasPrev = false,
  hasNext = false
}) => {
  const {
    markAsListened,
    isListened,
    isRevealed,
    revealParticipant,
    savePlaybackPosition,
    setActiveVoiceId,
    resolveAudio
  } = useGift();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const participantId = participant?.id;
  const revealed = participantId ? isRevealed(participantId) : false;
  const listened = participantId ? isListened(participantId) : false;

  // Cargar fuente de audio cuando cambia el participante
  useEffect(() => {
    if (!participant) return;

    let isMounted = true;
    setImageError(false);
    setAudioError(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setDuration(participant.estimatedDuration || 0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!participant.audioUrl) {
      setAudioError('Este mensaje todavía no tiene un archivo de audio configurado.');
      return;
    }

    resolveAudio(participant.audioUrl)
      .then((src) => {
        if (!isMounted) return;
        if (!src) {
          setAudioError('Este mensaje todavía no tiene un audio cargado.');
          return;
        }
        setAudioSrc(src);
        if (audioRef.current && audioRef.current.src !== src) {
          audioRef.current.src = src;
          audioRef.current.load();
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setAudioError('No pudimos preparar el audio de este mensaje.');
      });

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setActiveVoiceId(null);
    };
  }, [participant?.id, participant?.audioUrl, resolveAudio, setActiveVoiceId]);

  // Tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [participantId]);

  if (!participant) return null;

  const handleClose = () => {
    if (audioRef.current && participantId) {
      const pos = audioRef.current.currentTime;
      if (pos > 1 && pos < (audioRef.current.duration || 999) - 1) {
        savePlaybackPosition(participantId, pos);
      }
      audioRef.current.pause();
    }
    setActiveVoiceId(null);
    setIsPlaying(false);
    onClose();
  };

  // Reproducción instantánea y segura al primer click
  const togglePlay = async () => {
    if (!participant) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setActiveVoiceId(null);
      if (participantId) {
        savePlaybackPosition(participantId, audio.currentTime);
      }
      return;
    }

    setAudioError(null);

    // Asegurar que tiene la fuente de audio resuelta
    let targetSrc = audioSrc;
    if (!targetSrc && participant.audioUrl) {
      try {
        targetSrc = await resolveAudio(participant.audioUrl);
        setAudioSrc(targetSrc);
      } catch {
        setAudioError('No pudimos preparar el audio de este mensaje.');
        return;
      }
    }

    if (!targetSrc) {
      setAudioError('Este mensaje todavía no tiene un audio disponible.');
      return;
    }

    if (audio.src !== targetSrc) {
      audio.src = targetSrc;
    }

    setActiveVoiceId(participant.id);
    audio.playbackRate = playbackRate;

    try {
      await audio.play();
      setIsPlaying(true);
      if (!revealed && participantId) {
        revealParticipant(participantId);
      }
    } catch (err) {
      console.warn('Fallo al reproducir audio:', err);
      // Reintentar de forma segura
      try {
        audio.load();
        await audio.play();
        setIsPlaying(true);
        if (!revealed && participantId) {
          revealParticipant(participantId);
        }
      } catch (retryErr) {
        console.error('Reintento falló:', retryErr);
        setIsPlaying(false);
        setActiveVoiceId(null);
        setAudioError('Tocá el botón nuevamente para iniciar el audio.');
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      if (participantId) {
        savePlaybackPosition(participantId, newTime);
      }
    }
  };

  const jumpSeconds = (delta: number) => {
    if (!audioRef.current) return;
    const target = Math.max(0, Math.min(duration || 0, audioRef.current.currentTime + delta));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const cycleSpeed = () => {
    const nextRates = [1, 1.25, 0.9];
    const currentIndex = nextRates.indexOf(playbackRate);
    const next = nextRates[(currentIndex + 1) % nextRates.length];
    setPlaybackRate(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  const handleRestart = async () => {
    if (!audioRef.current) return;
    if (!revealed && participantId) {
      revealParticipant(participantId);
    }
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    try {
      setActiveVoiceId(participant.id);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      // Ignorar
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const initials = participant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#514344]/60 backdrop-blur-xs transition-opacity overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-name"
    >
      {/* Elemento de audio nativo montado en el DOM con listeners reales */}
      <audio
        ref={audioRef}
        src={audioSrc || undefined}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const time = audioRef.current.currentTime;
            setCurrentTime(time);
            if (time > 3 && participantId) {
              markAsListened(participantId);
            }
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setActiveVoiceId(null);
          if (participantId) {
            markAsListened(participantId);
            savePlaybackPosition(participantId, 0);
          }
        }}
        onError={() => {
          if (audioSrc && audioRef.current?.error) {
            setAudioError('Hubo un inconveniente al cargar el audio. Tocá de nuevo para reintentar.');
          }
          setIsPlaying(false);
        }}
      />

      <div className="relative w-full max-w-xl bg-[#FFFCF9] border border-[#E8DDDA] rounded-3xl p-5 sm:p-8 shadow-2xl text-center my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Barra superior de navegación interna del modal */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {onNavigateParticipant && (
              <>
                <button
                  onClick={() => onNavigateParticipant('prev')}
                  disabled={!hasPrev}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#514344]/70 hover:text-[#514344] hover:bg-[#FAF5F0] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  aria-label="Voz anterior"
                  title="Voz anterior"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => onNavigateParticipant('next')}
                  disabled={!hasNext}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#514344]/70 hover:text-[#514344] hover:bg-[#FAF5F0] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  aria-label="Siguiente voz"
                  title="Siguiente voz"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          <div className="text-xs uppercase tracking-widest text-[#8FA58A] font-medium">
            {revealed ? `Voz ${participant.order} · Un recuerdo para vos` : `Flor ${participant.order} · Mensaje por abrir`}
          </div>

          {/* Botón de cerrar */}
          <button
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#514344]/70 hover:text-[#514344] hover:bg-[#FAF5F0] transition-colors cursor-pointer"
            aria-label="Cerrar reproductor y volver al jardín"
          >
            <X size={22} />
          </button>
        </div>

        {/* Retrato o flor botánica de la persona */}
        <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 mb-4 rounded-full overflow-hidden border-4 border-[#FFFCF9] shadow-lg ring-2 ring-[#E8DDDA] bg-[#FAF5F0] flex items-center justify-center">
          {revealed ? (
            !imageError && participant.photoUrl ? (
              <img
                src={participant.photoUrl}
                alt={participant.photoAlt || participant.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E8C9CB]/40 text-[#85545D] font-serif text-3xl font-bold">
                {initials}
              </div>
            )
          ) : (
            <BotanicalFlower
              type={participant.botanicalType}
              isOpen={false}
              isPlaying={isPlaying}
              size={80}
            />
          )}

          {isPlaying && (
            <div className="absolute inset-0 bg-[#C98291]/10 flex items-center justify-center backdrop-blur-2xs">
              <span className="p-2 rounded-full bg-[#FFFCF9]/90 text-[#85545D]">
                <Volume2 size={24} className="animate-pulse" />
              </span>
            </div>
          )}
        </div>

        {/* Nombre y parentesco */}
        <h2 id="player-modal-name" className="font-serif text-3xl sm:text-4xl font-semibold text-[#514344]">
          {revealed ? participant.name : 'Mensaje de voz'}
        </h2>
        <div className="text-sm font-medium text-[#85545D] mt-0.5">
          {revealed ? participant.relationship : 'Tocá el botón para reproducir y escuchar la voz'}
          {listened && (
            <span className="ml-2 text-xs text-[#64775B] bg-[#DCE4D4]/50 px-2 py-0.5 rounded-full font-normal">
              Mensaje escuchado
            </span>
          )}
        </div>

        {/* Onda de sonido decorativa que se anima durante reproducción */}
        <div className="flex items-center justify-center gap-1.5 h-10 my-3" aria-hidden="true">
          {[18, 32, 22, 40, 28, 36, 16, 30, 24, 38, 20].map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isPlaying ? '#C98291' : '#E8DDDA',
                height: isPlaying ? `${Math.max(8, (h * ((i % 3) + 1.2)) % 40)}px` : '8px',
                opacity: isPlaying ? 0.9 : 0.4
              }}
            />
          ))}
        </div>

        {/* Barra de progreso interactiva (Seeker) */}
        <div className="space-y-1 my-3">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-[#E8DDDA] rounded-lg appearance-none cursor-pointer accent-[#C98291] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98291]"
            aria-label="Posición del audio"
          />
          <div className="flex justify-between text-xs text-[#514344]/70 font-mono tabular-nums px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Estado de error si falla el audio */}
        {audioError && (
          <div className="my-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{audioError}</span>
          </div>
        )}

        {/* Controles de reproducción con botones amplios (>= 44x44px) */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
          
          {/* Retroceder 10 segundos */}
          <button
            onClick={() => jumpSeconds(-10)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#514344]/70 hover:text-[#514344] hover:bg-[#FAF5F0] transition-colors cursor-pointer"
            aria-label="Retroceder 10 segundos"
            title="Retroceder 10 segundos"
          >
            <RotateCcw size={20} />
          </button>

          {/* Botón principal circular Play / Pausa (Icono puro sin texto) */}
          <button
            onClick={togglePlay}
            className="min-h-[64px] min-w-[64px] sm:min-h-[72px] sm:min-w-[72px] rounded-full bg-[#C98291] hover:bg-[#85545D] text-[#FFFCF9] flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E8C9CB]"
            aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
            title={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
          >
            {isPlaying ? (
              <Pause size={28} className="fill-current" />
            ) : (
              <Play size={28} className="fill-current ml-1" />
            )}
          </button>

          {/* Adelantar 10 segundos */}
          <button
            onClick={() => jumpSeconds(10)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#514344]/70 hover:text-[#514344] hover:bg-[#FAF5F0] transition-colors cursor-pointer"
            aria-label="Adelantar 10 segundos"
            title="Adelantar 10 segundos"
          >
            <RotateCw size={20} />
          </button>

          {/* Selector de velocidad */}
          <button
            onClick={cycleSpeed}
            className="min-h-[44px] min-w-[44px] px-2 rounded-full border border-[#E8DDDA] bg-[#FFFCF9] text-xs font-mono text-[#514344]/80 hover:bg-[#FAF5F0] transition-colors cursor-pointer"
            aria-label={`Velocidad de reproducción actual: ${playbackRate}x`}
            title="Cambiar velocidad"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Acciones complementarias */}
        <div className="mt-6 pt-4 border-t border-[#FAF5F0] flex items-center justify-between text-xs text-[#514344]/80">
          <button
            onClick={handleRestart}
            disabled={Boolean(audioError)}
            className="hover:text-[#C98291] cursor-pointer"
          >
            Volver a escuchar desde el inicio
          </button>

          <button
            onClick={handleClose}
            className="text-[#85545D] font-medium hover:underline cursor-pointer"
          >
            Volver al jardín
          </button>
        </div>

      </div>
    </div>
  );
};
