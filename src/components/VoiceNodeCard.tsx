/**
 * ============================================================================
 * ARCHIVO: src/components/VoiceNodeCard.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente visual de cada tarjeta de flor en el mapa del jardín.
 * Representa el nodo interactivo de un familiar o ser querido que dejó un mensaje de voz.
 *
 * ¿QUÉ CONTIENE?
 * - `VoiceNodeCardProps`:
 *   - `participant`: Datos completos del familiar (`name`, `photoUrl`, `transcription`, etc.).
 *   - `onSelect`: Función callback que se dispara al pulsar la tarjeta para abrir el reproductor modal.
 * - Renderizado condicional según estado:
 *   1. Estado "Mensaje por abrir": Muestra la flor en capullo y el botón de Play para escuchar la voz.
 *   2. Estado "Escuchado / Revelado": Muestra la fotografía del familiar, su nombre, la flor abierta,
 *      la insignia de escuchado y la transcripción completa del audio (`participant.transcription`).
 *
 * ¿CÓMO FUNCIONA?
 * - Consulta el estado global mediante `useGift()` (`isRevealed`, `isListened`, `activeVoiceId`).
 * - Al tocar la tarjeta o el botón de Play, invoca `onSelect(participant)`.
 * - Una vez que el audio se reproduce y se marca como escuchado, la tarjeta devela la identidad
 *   y presenta el texto transcripto para que Jesi pueda leerlo y recordarlo siempre.
 *
 * ¿CÓMO MODIFICAR O PERSONALIZAR?
 * - Para cambiar el texto transcripto: editá la propiedad `transcription` del participante
 *   correspondiente en `src/config/giftConfig.ts`.
 * - Para cambiar la foto o el nombre: modificá `photoUrl` y `name` en `src/config/giftConfig.ts`.
 *
 * PRECISIONES TÉCNICAS:
 * - Incluye fallback elegante de iniciales tipográficas si una imagen no llega a cargar (`imageError`).
 * - Se resaltan sutilmente los bordes con un anillo (`ring-2`) cuando el audio de esa tarjeta está sonando activamente.
 * ============================================================================
 */

import React, { useState } from 'react';
import { Play, Check, Volume2 } from 'lucide-react';
import { Participant } from '../types/gift';
import { BotanicalFlower } from './BotanicalFlower';
import { useGift } from '../context/GiftContext';

interface VoiceNodeCardProps {
  participant: Participant;
  onSelect: (participant: Participant) => void;
}

export const VoiceNodeCard: React.FC<VoiceNodeCardProps> = ({ participant, onSelect }) => {
  const { isRevealed, isListened, activeVoiceId } = useGift();
  const [imageError, setImageError] = useState(false);

  const revealed = isRevealed(participant.id);
  const listened = isListened(participant.id);
  const isCurrentlyPlaying = activeVoiceId === participant.id;

  // Iniciales para fallback seguro de imagen
  const initials = participant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`group relative bg-[#FFFCF9] border rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between ${
        isCurrentlyPlaying
          ? 'border-[#C98291] ring-2 ring-[#C98291]/30 shadow-md'
          : listened
          ? 'border-[#8FA58A]/40 shadow-xs hover:border-[#8FA58A]'
          : revealed
          ? 'border-[#E8DDDA] hover:border-[#C98291]/60 shadow-xs'
          : 'border-[#E8DDDA] hover:border-[#E8C9CB] bg-gradient-to-b from-[#FFFCF9] to-[#FAF5F0]'
      }`}
    >
      {/* Contenido principal clicable */}
      <button
        onClick={() => onSelect(participant)}
        className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98291] rounded-xl"
        aria-label={
          revealed
            ? `Escuchar mensaje de ${participant.name}, ${participant.relationship}`
            : `Escuchar mensaje de voz asociado a la flor ${participant.order}`
        }
      >
        <div className="flex items-start gap-4">
          
          {/* Avatar / Flor botánica */}
          <div className="relative shrink-0">
            {revealed ? (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#E8DDDA] bg-[#FAF5F0]">
                {!imageError && participant.photoUrl ? (
                  <img
                    src={participant.photoUrl}
                    alt={participant.photoAlt || participant.name}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#E8C9CB]/40 text-[#85545D] font-serif text-lg font-semibold">
                    {initials}
                  </div>
                )}
                {/* Indicador de flor miniatura */}
                <div className="absolute -bottom-1 -right-1 bg-[#FFFCF9] rounded-full p-0.5 border border-[#E8DDDA]">
                  <BotanicalFlower type={participant.botanicalType} isOpen={true} size={22} />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FAF5F0] border-2 border-dashed border-[#E8DDDA] flex items-center justify-center group-hover:border-[#C98291] transition-colors">
                <BotanicalFlower
                  type={participant.botanicalType}
                  isOpen={false}
                  isPlaying={isCurrentlyPlaying}
                  size={46}
                />
              </div>
            )}
          </div>

          {/* Información del mensaje */}
          <div className="flex-1 min-w-0 pr-2">
            
            {/* Estado superior */}
            <div className="flex items-center gap-2 text-xs text-[#8FA58A] mb-1">
              <span>Flor {participant.order}</span>
              <span aria-hidden="true">·</span>
              {listened ? (
                <span className="flex items-center gap-1 text-[#64775B] font-medium">
                  <Check size={12} className="stroke-[3]" />
                  <span>Escuchado</span>
                </span>
              ) : isCurrentlyPlaying ? (
                <span className="flex items-center gap-1 text-[#C98291] font-medium animate-pulse">
                  <Volume2 size={12} />
                  <span>Sonando</span>
                </span>
              ) : revealed ? (
                <span className="text-[#85545D]">Voz descubierta</span>
              ) : (
                <span className="text-[#8FA58A]">Mensaje por abrir</span>
              )}
            </div>

            {/* Título: Nombre si está revelado, o invitación si no */}
            {revealed ? (
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#514344] leading-tight truncate">
                  {participant.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#85545D] font-medium mt-0.5">
                  {participant.relationship}
                  {participant.estimatedDuration && (
                    <span className="text-[#514344]/50 ml-2 font-normal font-mono tabular-nums">
                      ~{participant.estimatedDuration}s
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-[#514344] leading-snug">
                  Una voz especial
                </h3>
                <p className="text-xs text-[#85545D]/80 italic mt-0.5">
                  Tocá para escuchar su mensaje
                </p>
              </div>
            )}

            {/* Transcripción del audio (se muestra únicamente una vez escuchado el mensaje) */}
            {listened && (participant.transcription || participant.highlightQuote) && (
              <div className="mt-2.5 pt-2 border-t border-[#E8DDDA]/60">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8FA58A] block mb-0.5">
                  Transcripción:
                </span>
                <p className="text-xs text-[#514344]/90 leading-relaxed font-serif italic">
                  “{participant.transcription || participant.highlightQuote}”
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Zona inferior de acción */}
        <div className="mt-4 pt-3 border-t border-[#FAF5F0] flex items-center justify-between">
          {revealed ? (
            <div className="flex items-center gap-2 text-xs font-medium text-[#C98291] group-hover:text-[#85545D] transition-colors">
              <span className="w-7 h-7 rounded-full bg-[#E8C9CB]/40 flex items-center justify-center text-[#85545D]">
                <Play size={12} className="fill-current ml-0.5" />
              </span>
              <span>{listened ? 'Volver a escuchar voz' : 'Escuchar mensaje de voz'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-[#C98291] group-hover:text-[#85545D] transition-colors">
              <span className="w-7 h-7 rounded-full bg-[#E8C9CB]/40 flex items-center justify-center text-[#85545D]">
                <Play size={12} className="fill-current ml-0.5" />
              </span>
              <span>Reproducir audio</span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
};
