/**
 * ============================================================================
 * ARCHIVO: src/components/Header.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es la barra superior de navegación y control global (Header). Se mantiene fija
 * en la parte superior de la pantalla (`sticky top-0`) durante todo el recorrido.
 *
 * ¿QUÉ CONTIENE?
 * - `HeaderProps`:
 *   - `currentTab`: Pestaña actualmente visible ('garden' para el Jardín o 'letter' para la Carta Final).
 *   - `onNavigateTab`: Función para cambiar entre las pestañas.
 *   - `onOpenContinuousMode`: Función para iniciar la reproducción de todas las voces en secuencia.
 * - Elementos de la interfaz:
 *   - Título del regalo y homenajeada ("Jesi · Día de la Madre").
 *   - Selector de pestañas: Pestaña "Jardín" y pestaña "Carta Final".
 *   - Botón directo "Escuchar todas" (se activa cuando todas las voces individuales fueron escuchadas).
 *   - Botón de control de sonido ambiental (activa / silencia la música de fondo instrumental).
 *
 * ¿CÓMO FUNCIONA?
 * - Consulta el estado de avance en `GiftContext`:
 *   1. `allDiscovered` y `allListened`: Verifica que se hayan descubierto y escuchado individualmente todas las voces.
 *   2. `canAccessFinalLetter = allDiscovered && allListened && hasPlayedSequence`:
 *      Condición estricta requerida para que el botón de la Carta Final sea accesible en el menú.
 * - El botón de sonido ambiental conmuta `setBgMusicEnabled(!bgMusicEnabled)`.
 *
 * ¿CÓMO CONFIGURAR O PERSONALIZAR?
 * - Los textos principales del encabezado se toman de `config.productName` y `config.honoreeName` en `src/config/giftConfig.ts`.
 *
 * PRECISIONES TÉCNICAS:
 * - Emplea `backdrop-blur-md` y color semitransparente para que el contenido se deslice con elegancia por debajo.
 * ============================================================================
 */

import React from 'react';
import { Volume2, VolumeX, BookOpen, Sparkles } from 'lucide-react';
import { useGift } from '../context/GiftContext';

interface HeaderProps {
  currentTab: 'garden' | 'letter';
  onNavigateTab: (tab: 'garden' | 'letter') => void;
  onOpenContinuousMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigateTab,
  onOpenContinuousMode
}) => {
  const {
    config,
    revealedIds,
    listenedIds,
    hasPlayedSequence,
    bgMusicEnabled,
    setBgMusicEnabled
  } = useGift();

  const totalVoices = config.participants.length;
  const discoveredCount = revealedIds.length;
  const listenedCount = listenedIds.length;
  const allDiscovered = totalVoices > 0 && discoveredCount === totalVoices;
  const allListened = totalVoices > 0 && listenedCount === totalVoices;
  const canAccessFinalLetter = allDiscovered && allListened && hasPlayedSequence;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF5F0]/90 backdrop-blur-md border-b border-[#E8DDDA] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('garden')}
            className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98291] rounded-lg p-1 -m-1"
            aria-label="Ir al jardín de voces"
          >
            <span className="font-serif text-2xl font-semibold tracking-tight text-[#514344] group-hover:text-[#C98291] transition-colors whitespace-nowrap block">
              {config.productName}
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-6 text-sm font-medium text-[#514344]">
          <button
            onClick={() => onNavigateTab('garden')}
            className={`whitespace-nowrap cursor-pointer transition-colors hover:text-[#C98291] ${
              currentTab === 'garden' ? 'text-[#C98291] font-semibold underline underline-offset-8 decoration-2' : 'text-[#514344]'
            }`}
          >
            El Jardín
          </button>

          {allDiscovered && allListened && (
            <button
              onClick={onOpenContinuousMode}
              className="whitespace-nowrap cursor-pointer transition-colors hover:text-[#C98291] flex items-center gap-1.5"
            >
              <Sparkles size={15} className="text-[#8FA58A]" />
              <span>Escuchar todas</span>
            </button>
          )}

          {canAccessFinalLetter && (
            <button
              onClick={() => onNavigateTab('letter')}
              className={`whitespace-nowrap cursor-pointer transition-colors hover:text-[#C98291] flex items-center gap-1.5 ${
                currentTab === 'letter' ? 'text-[#C98291] font-semibold underline underline-offset-8 decoration-2' : 'text-[#514344]'
              }`}
            >
              <BookOpen size={15} className="text-[#8FA58A]" />
              <span>Carta Final</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Controls (Music + Progress) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Indicador emocional de progreso */}
          <div
            className="flex items-center gap-1.5 text-xs text-[#514344] bg-[#FFFCF9] border border-[#E8DDDA] px-3 py-1.5 rounded-full"
            title={`${discoveredCount} de ${totalVoices} voces descubiertas`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#8FA58A]" />
            <span className="font-mono tabular-nums">{discoveredCount}/{totalVoices}</span>
            <span className="text-[#85545D]/80">voces</span>
          </div>

          {/* Toggle de música instrumental de fondo */}
          <button
            onClick={() => setBgMusicEnabled(!bgMusicEnabled)}
            className={`cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-all border ${
              bgMusicEnabled
                ? 'bg-[#E8C9CB]/40 border-[#C98291] text-[#85545D]'
                : 'bg-[#FFFCF9] border-[#E8DDDA] text-[#514344]/70 hover:text-[#514344]'
            }`}
            aria-label={bgMusicEnabled ? 'Silenciar música instrumental de fondo' : 'Activar música instrumental de fondo'}
            title={bgMusicEnabled ? 'Música instrumental activa (clic para silenciar)' : 'Activar música instrumental suave'}
          >
            {bgMusicEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

      </div>
    </header>
  );
};
