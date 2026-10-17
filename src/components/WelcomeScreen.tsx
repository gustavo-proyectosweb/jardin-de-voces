/**
 * ============================================================================
 * ARCHIVO: src/components/WelcomeScreen.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es la pantalla de portada y apertura del sobre de regalo. Constituye la primera
 * impresión visual y emotiva que recibe Jesi al ingresar a la experiencia.
 *
 * ¿QUÉ CONTIENE?
 * - `WelcomeScreenProps`:
 *   - `onOpenGift`: Callback invocado tras la animación de apertura para mostrar el jardín.
 * - `WelcomeScreen`: Componente que renderiza:
 *   - Sobre de regalo con sello de lacre y dedicatoria personalizada para Jesi.
 *   - Título cálido y mensaje introductorio de la familia.
 *   - Botón interactivo "Abrir tu regalo".
 *   - Fondos etéreos con difuminado suave en tonos salvia y rosa empolvado.
 *
 * ¿CÓMO FUNCIONA?
 * - Cuando Jesi pulsa el sobre o el botón de apertura, se inicia un sutil despliegue animado.
 * - Si el sistema operativo tiene activada la preferencia de accesibilidad de reducción de movimiento
 *   (`prefers-reduced-motion`), la transición ocurre de manera casi inmediata sin mareos visuales.
 * - Tras abrirse, ejecuta `setHasSeenEnvelope(true)` en `GiftContext` para que la agasajada no
 *   tenga que volver a abrir el sobre si recarga la página.
 *
 * ¿CÓMO CONFIGURAR O PERSONALIZAR?
 * - Para cambiar los textos de la bienvenida (título, dedicatoria, nota al pie), edita los campos:
 *   `welcomeTitle`, `welcomeSubtitle`, `welcomeBody`, `welcomeCta` y `welcomeFooterNote` en `src/config/giftConfig.ts`.
 * - Para cambiar la imagen del sobre: cambia `envelopeImage` en `src/config/giftConfig.ts`.
 *
 * PRECISIONES TÉCNICAS:
 * - Emplea clases Tailwind con transiciones aceleradas por hardware (`duration-700`, `scale-105`, `blur-3xl`).
 * ============================================================================
 */

import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { useGift } from '../context/GiftContext';

interface WelcomeScreenProps {
  onOpenGift: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenGift }) => {
  const { config, setHasSeenEnvelope } = useGift();
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Verificar preferencia de movimiento reducido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = prefersReducedMotion ? 50 : 900;

    setTimeout(() => {
      setHasSeenEnvelope(true);
      onOpenGift();
    }, delay);
  };

  return (
    <div className="min-h-screen bg-[#FAF5F0] flex flex-col items-center justify-between px-4 sm:px-6 py-8 sm:py-12 select-none relative overflow-hidden">
      
      {/* Sutiles detalles botánicos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#E8C9CB]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#DCE4D4]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Marca discreta superior */}
      <div className="text-center shrink-0 z-10 pt-2 sm:pt-4">
        <span className="font-serif text-xl sm:text-2xl font-medium tracking-wide text-[#514344]">
          {config.productName}
        </span>
        <span className="block text-[11px] sm:text-xs uppercase tracking-widest text-[#8FA58A] mt-0.5">
          {config.edition}
        </span>
      </div>

      {/* Contenedor central de la carta / sobre */}
      <div className="max-w-xl w-full my-auto text-center z-10 px-2 py-4">
        
        {/* Tarjeta sobre con animación de apertura */}
        <div
          className={`relative mx-auto max-w-sm sm:max-w-md bg-[#FFFCF9] border border-[#E8DDDA] rounded-3xl p-3 sm:p-4 shadow-xl transition-all duration-700 ${
            isOpening ? 'scale-105 opacity-90 blur-2xs -translate-y-2' : 'hover:shadow-2xl'
          }`}
        >
          {/* Imagen de papelería fina con lazo y flores secas */}
          <div className="relative rounded-2xl overflow-hidden aspect-square sm:aspect-4/3 bg-[#FAF5F0] border border-[#E8DDDA]/60">
            <img
              src={config.envelopeImage}
              alt="Sobre de regalo de papelería fina con cinta y flores secas"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700"
            />
            
            {/* Sello de lacre o etiqueta delicada superpuesta */}
            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFFCF9]/95 backdrop-blur-xs rounded-full border border-[#E8DDDA] text-xs font-serif text-[#85545D] shadow-xs">
                <Heart size={12} className="fill-[#C98291] text-[#C98291]" />
                <span>Para {config.honoreeName}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Textos emocionales */}
        <div className="mt-8 sm:mt-10 max-w-lg mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#514344] leading-tight">
            {config.welcomeTitle}
          </h1>

          <p className="font-serif text-lg sm:text-xl text-[#85545D] italic mt-3 mb-4 leading-relaxed">
            “{config.welcomeSubtitle}”
          </p>

          <p className="text-xs sm:text-sm text-[#514344]/80 leading-relaxed max-w-md mx-auto">
            {config.welcomeBody}
          </p>
        </div>

        {/* CTA principal */}
        <div className="mt-8 sm:mt-10">
          <button
            onClick={handleOpen}
            disabled={isOpening}
            className={`min-h-[52px] sm:min-h-[56px] px-8 sm:px-10 rounded-full bg-[#C98291] hover:bg-[#85545D] text-[#FFFCF9] font-medium text-base shadow-md transition-all active:scale-98 flex items-center justify-center gap-2.5 mx-auto cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E8C9CB] ${
              isOpening ? 'opacity-80 scale-98' : ''
            }`}
            aria-label="Abrir tu regalo del Día de la Madre"
          >
            <Sparkles size={18} className={isOpening ? 'animate-spin' : ''} />
            <span>{isOpening ? 'Abriendo tu regalo...' : config.welcomeCta}</span>
          </button>
        </div>

      </div>

      {/* Nota al pie discreta */}
      <div className="text-center shrink-0 z-10 pt-4 pb-2 text-xs text-[#514344]/70">
        <p>{config.welcomeFooterNote}</p>
        {config.giftDate && <p className="text-[11px] text-[#8FA58A] mt-0.5">{config.giftDate}</p>}
      </div>

    </div>
  );
};
