/**
 * ============================================================================
 * ARCHIVO: src/components/FinalLetterScreen.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es la vista solemne y emotiva de la Carta Final. Representa el clímax emocional
 * del regalo, donde se revela una carta colectiva redactada por toda la familia.
 *
 * CONDICIONES DE ACCESO:
 * Solo es accesible cuando se cumplen dos requisitos indispensables:
 * 1. Haber desbloqueado y escuchado todos los audios individuales en el jardín.
 * 2. Haber reproducido al menos una vez la opción "Escuchar todas las voces en secuencia".
 *
 * ¿QUÉ CONTIENE?
 * - `FinalLetterScreenProps`:
 *   - `onBackToGarden`: Función para regresar a la vista del jardín floral.
 * - Elementos de la carta:
 *   - Fotografía familiar destacada (`familyPhotoUrl`).
 *   - Título y subtítulo con tipografía serif refinada (`Cormorant Garamond`).
 *   - Cuerpo del mensaje dividido en párrafos cálidos y conmovedores.
 *   - Mosaico fotográfico con los retratos de todos los familiares que participaron.
 *   - Firma final ("Con todo nuestro amor, hoy y siempre. Tu familia ❤️").
 *   - Botón inferior "Volver a recorrer el jardín".
 *
 * ¿CÓMO FUNCIONA?
 * - Renderiza los textos definidos en `config` a través de `useGift()`.
 * - Filtra a los participantes revelados para mostrar el carrusel/mosaico de rostros afectivos.
 *
 * ¿CÓMO CONFIGURAR O PERSONALIZAR EL CONTENIDO DE LA CARTA?
 * - Toda la carta se personaliza en `src/config/giftConfig.ts`:
 *   - `familyPhotoUrl`: Foto familiar grupal.
 *   - `finalLetterTitle`: Título de la carta.
 *   - `finalLetterSubtitle`: Subtítulo.
 *   - `finalLetterParagraphs`: Arreglo de strings, donde cada elemento es un párrafo.
 *   - `finalLetterSignature`: Firma o despedida al pie.
 *
 * PRECISIONES TÉCNICAS:
 * - Diseñado con estética de pliego editorial sobre papel fino con bordes suaves y sombra tenue.
 * ============================================================================
 */

import React, { useState } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { useGift } from '../context/GiftContext';

interface FinalLetterScreenProps {
  onBackToGarden: () => void;
  onOpenContinuousMode?: () => void;
}

export const FinalLetterScreen: React.FC<FinalLetterScreenProps> = ({
  onBackToGarden
}) => {
  const { config, revealedIds } = useGift();
  const [photoError, setPhotoError] = useState(false);

  // Mosaico de personas reveladas
  const revealedParticipants = config.participants.filter((p) => revealedIds.includes(p.id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      
      {/* Botón superior para volver al jardín */}
      <div className="mb-6">
        <button
          onClick={onBackToGarden}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#85545D] hover:text-[#C98291] transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Volver al jardín de recuerdos</span>
        </button>
      </div>

      {/* Contenedor tipo pliego editorial / carta fina */}
      <article className="bg-[#FFFCF9] border border-[#E8DDDA] rounded-3xl p-6 sm:p-12 shadow-xl relative overflow-hidden">
        
        {/* Adorno botánico sutil en esquina */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#E8C9CB]/20 rounded-bl-full pointer-events-none" />

        {/* Encabezado */}
        <header className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs uppercase tracking-widest text-[#8FA58A] font-medium block mb-2">
            El abrazo final · {config.edition}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#514344] leading-tight">
            {config.finalLetterTitle}
          </h1>
          <p className="font-serif text-lg sm:text-2xl text-[#85545D] italic mt-3 leading-relaxed">
            “{config.finalLetterSubtitle}”
          </p>
        </header>

        {/* Foto familiar grupal principal */}
        <div className="relative rounded-2xl overflow-hidden border border-[#E8DDDA] shadow-md mb-10 max-w-3xl mx-auto bg-[#FAF5F0] aspect-16/9">
          {!photoError && config.familyPhotoUrl ? (
            <img
              src={config.familyPhotoUrl}
              alt="Fotografía familiar celebrando juntos"
              referrerPolicy="no-referrer"
              onError={() => setPhotoError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#FAF5F0]">
              <Heart size={40} className="text-[#C98291] mb-2" />
              <p className="font-serif text-xl font-medium text-[#514344]">Unidos por el mismo amor</p>
            </div>
          )}
        </div>

        {/* Mosaico de rostros descubiertos */}
        {revealedParticipants.length > 0 && (
          <div className="mb-10 p-5 bg-[#FAF5F0] rounded-2xl border border-[#E8DDDA]">
            <p className="text-xs uppercase tracking-wider text-[#8FA58A] font-medium text-center mb-4">
              Las voces que abrazaron tu día
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {revealedParticipants.map((p) => (
                <div key={p.id} className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FFFCF9] shadow-xs">
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#514344] mt-1">{p.name}</span>
                  <span className="text-[10px] text-[#85545D]">{p.relationship}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cuerpo de la carta */}
        <div className="space-y-6 text-[#514344] font-serif text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto px-2">
          {config.finalLetterParagraphs.map((para, idx) => (
            <p key={idx} className="first-letter:text-2xl first-letter:font-semibold">
              {para}
            </p>
          ))}
        </div>

        {/* Firma colectiva */}
        <div className="mt-12 pt-8 border-t border-[#E8DDDA] text-center max-w-lg mx-auto">
          <div className="font-serif text-xl sm:text-2xl text-[#85545D] italic whitespace-pre-line leading-relaxed">
            {config.finalLetterSignature}
          </div>
          {config.giftDate && (
            <div className="text-xs text-[#8FA58A] uppercase tracking-wider mt-3">
              {config.giftDate}
            </div>
          )}
        </div>

        {/* Acciones para continuar o revivir */}
        <div className="mt-12 pt-6 border-t border-[#FAF5F0] flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onBackToGarden}
            className="px-6 py-3 rounded-full bg-[#C98291] hover:bg-[#85545D] text-[#FFFCF9] text-sm font-medium transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Volver a recorrer el jardín</span>
          </button>
        </div>

      </article>

    </div>
  );
};
