/**
 * ============================================================================
 * ARCHIVO: src/components/GardenMapScreen.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es la vista central del Jardín Interactivo de Voces. Presenta la cuadrícula de
 * flores botánicas, el contador de mensajes descubiertos y los accesos condicionales
 * al modo continuo de audio y a la Carta Final.
 *
 * ¿QUÉ CONTIENE?
 * - `GardenMapScreenProps`:
 *   - `onSelectParticipant`: Callback invocado al pulsar una flor para abrir el modal individual.
 *   - `onOpenContinuousMode`: Callback para iniciar la secuencia completa de voces.
 *   - `onOpenFinalLetter`: Callback para navegar a la Carta Final.
 * - Elementos de la pantalla:
 *   - Título y subtítulo del jardín ("Un jardín lleno de voces").
 *   - Barra de estado y progreso ("X de Y mensajes escuchados").
 *   - Botón "Escuchar todas las voces en secuencia":
 *     * Validado: Solo se habilita cuando Jesi descubrió y escuchó todos los audios individuales.
 *   - Cuadrícula responsiva (Grid 1/2/3 columnas) que renderiza cada `VoiceNodeCard`.
 *   - Tarjeta final especial de invitación a la Carta Final:
 *     * Solo aparece cuando se cumplen ambas condiciones:
 *       1) Todos los audios individuales escuchados (`allListened`).
 *       2) Modo secuencia reproducido al menos una vez (`hasPlayedSequence`).
 *
 * ¿CÓMO FUNCIONA?
 * - Consume el estado global de `useGift()` (`revealedIds`, `listenedIds`, `hasPlayedSequence`).
 * - Mantiene el orden botánico asignado en la configuración (`config.participants`).
 * - Renderiza cada nodo floral de manera independiente con su respectivo estado visual.
 *
 * ¿CÓMO CONFIGURAR O PERSONALIZAR?
 * - Para cambiar el título, subtítulo o texto de ayuda del jardín: modificalos en `src/config/giftConfig.ts`
 *   (`gardenTitle`, `gardenSubtitle`, `gardenHelpText`).
 * - Para agregar o quitar participantes familiares: agregá o quitá elementos en `config.participants`.
 *
 * PRECISIONES TÉCNICAS:
 * - Diseño adaptable ("mobile first") optimizado para teléfonos móviles, tablets y computadoras de escritorio.
 * ============================================================================
 */

import React from 'react';
import { Sparkles, BookOpen, AlertCircle, Lock } from 'lucide-react';
import { Participant } from '../types/gift';
import { VoiceNodeCard } from './VoiceNodeCard';
import { useGift } from '../context/GiftContext';

interface GardenMapScreenProps {
  onSelectParticipant: (participant: Participant) => void;
  onOpenContinuousMode: () => void;
  onOpenFinalLetter: () => void;
}

export const GardenMapScreen: React.FC<GardenMapScreenProps> = ({
  onSelectParticipant,
  onOpenContinuousMode,
  onOpenFinalLetter
}) => {
  const {
    config,
    revealedIds,
    listenedIds,
    hasPlayedSequence,
    storageWarning
  } = useGift();

  const total = config.participants.length;
  const discoveredCount = revealedIds.length;
  const listenedCount = listenedIds.length;
  const allDiscovered = total > 0 && discoveredCount === total;
  const allListened = total > 0 && listenedCount === total;
  const canAccessFinalLetter = allDiscovered && allListened && hasPlayedSequence;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      
      {/* Alerta si el almacenamiento local fue denegado */}
      {storageWarning && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-900 flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-amber-600" />
          <span>{storageWarning}</span>
        </div>
      )}

      {/* Encabezado editorial del Jardín */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8C9CB]/30 border border-[#E8DDDA] rounded-full text-xs text-[#85545D] font-medium mb-3">
          <span>{config.edition}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#514344] leading-tight">
          {config.gardenTitle}
        </h1>

        <p className="font-serif text-lg sm:text-xl text-[#85545D] italic mt-2.5 mb-2 leading-relaxed">
          {config.gardenSubtitle}
        </p>

        <p className="text-xs sm:text-sm text-[#514344]/80">
          {config.gardenHelpText}
        </p>

        {/* Indicador emocional de progreso */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-[#514344]">
          <div className="flex items-center gap-2 bg-[#FFFCF9] border border-[#E8DDDA] px-4 py-2 rounded-full shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8FA58A]" />
            <span>Voces descubiertas: <strong className="font-mono">{discoveredCount}</strong> de {total}</span>
          </div>

          {listenedCount > 0 && (
            <div className="flex items-center gap-2 bg-[#FFFCF9] border border-[#E8DDDA] px-4 py-2 rounded-full shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C98291]" />
              <span>Escuchaste <strong className="font-mono">{listenedCount}</strong> mensajes</span>
            </div>
          )}
        </div>

        {/* Acciones principales: Secuencia tras escuchar todos los audios individuales; Carta final tras ambas condiciones */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {allDiscovered && allListened ? (
            <>
              <button
                onClick={onOpenContinuousMode}
                className="px-5 py-2.5 rounded-full bg-[#FFFCF9] hover:bg-[#FAF5F0] border border-[#E8DDDA] text-xs sm:text-sm font-medium text-[#514344] hover:text-[#C98291] transition-colors shadow-2xs flex items-center gap-2 cursor-pointer animate-in fade-in"
              >
                <Sparkles size={15} className="text-[#8FA58A]" />
                <span>Escuchar todas las voces en secuencia</span>
              </button>

              {canAccessFinalLetter && (
                <button
                  onClick={onOpenFinalLetter}
                  className="px-5 py-2.5 rounded-full bg-[#C98291] hover:bg-[#85545D] text-xs sm:text-sm font-medium text-[#FFFCF9] transition-colors shadow-xs flex items-center gap-2 cursor-pointer animate-in fade-in"
                >
                  <BookOpen size={15} />
                  <span>Leer carta final</span>
                </button>
              )}
            </>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFCF9] border border-[#E8DDDA] rounded-full text-xs text-[#85545D]/80">
              <Lock size={13} className="text-[#8FA58A]" />
              <span>Descubrí y escuchá todas las voces para desbloquear la escucha continua y la carta final</span>
            </div>
          )}
        </div>
      </div>

      {/* Invitación especial si ya cumplió ambas condiciones para la carta final */}
      {canAccessFinalLetter && (
        <div className="mb-8 p-6 bg-[#FFFCF9] border border-[#8FA58A]/40 rounded-3xl text-center shadow-xs max-w-xl mx-auto animate-in fade-in">
          <span className="text-2xl mb-1 block">🌿</span>
          <h2 className="font-serif text-2xl font-semibold text-[#514344]">
            Completaste el recorrido del jardín
          </h2>
          <p className="text-xs sm:text-sm text-[#514344]/80 mt-1 mb-4">
            Cada una de estas voces guarda el amor sincero de tu familia. Te invitamos a leer la carta final que preparamos para vos.
          </p>
          <button
            onClick={onOpenFinalLetter}
            className="px-6 py-3 rounded-full bg-[#C98291] hover:bg-[#85545D] text-[#FFFCF9] text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <BookOpen size={16} />
            <span>Abrir la carta final</span>
          </button>
        </div>
      )}

      {/* Cuadrícula organizada de flores / voces */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {config.participants.map((participant) => (
          <VoiceNodeCard
            key={participant.id}
            participant={participant}
            onSelect={onSelectParticipant}
          />
        ))}
      </div>
    </div>
  );
};
