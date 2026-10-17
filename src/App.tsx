/**
 * ============================================================================
 * ARCHIVO: src/App.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente principal y orquestador de la aplicación. Gestiona la navegación
 * entre pantallas, el ciclo de vida de los modales y el flujo completo del regalo.
 *
 * ¿QUÉ CONTIENE?
 * 1. `MainExperience`: Componente que contiene la lógica de enrutamiento interno:
 *    - Si Jesi aún no abrió el sobre: Renderiza `WelcomeScreen`.
 *    - Si ya abrió el sobre: Renderiza la barra superior (`Header`) y la pestaña activa:
 *      * Pestaña 'garden': Muestra el `GardenMapScreen` con las flores familiares.
 *      * Pestaña 'letter': Muestra el `FinalLetterScreen` con la carta final familiar.
 *    - Modales flotantes:
 *      * `VoicePlayerModal`: Se activa cuando se selecciona un participante para escuchar su voz.
 *      * `PodcastModeModal`: Se activa para escuchar todas las voces en secuencia.
 * 2. `App`: Componente raíz exportado por defecto que envuelve toda la app en `GiftProvider`.
 *
 * ¿CÓMO FUNCIONA EL FLUJO DE LA EXPERIENCIA?
 * 1. PASO 1 (Bienvenida): Jesi ve el sobre sellado con dedicatoria y presiona "Abrir tu regalo".
 * 2. PASO 2 (Jardín de Voces): Jesi explora las flores. Cada flor tiene el botón Play para escuchar.
 *    Al escuchar una voz, se devela quién es y aparece la transcripción del audio.
 * 3. PASO 3 (Secuencia Continua): Una vez escuchadas todas las voces individuales, se habilita
 *    el botón "Escuchar todas las voces en secuencia".
 * 4. PASO 4 (Carta Final): Una vez reproducida la secuencia completa, se desbloquea el acceso
 *    a la Carta Final (tanto en el jardín como en el menú superior).
 *
 * ¿CÓMO MODIFICAR O PERSONALIZAR?
 * - No requiere cambios directos para modificar contenido: todos los textos, nombres, audios
 *   y fotos se configuran limpiamente en `src/config/giftConfig.ts`.
 *
 * PRECISIONES TÉCNICAS:
 * - Evita dependencias de librerías de enrutamiento complejas usando estados fluidos de React (`currentTab`, `selectedForPlayer`, `isPodcastOpen`).
 * ============================================================================
 */

import React, { useState } from 'react';
import { GiftProvider, useGift } from './context/GiftContext';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GardenMapScreen } from './components/GardenMapScreen';
import { FinalLetterScreen } from './components/FinalLetterScreen';
import { VoicePlayerModal } from './components/VoicePlayerModal';
import { PodcastModeModal } from './components/PodcastModeModal';
import { Participant } from './types/gift';

const MainExperience: React.FC = () => {
  const { hasSeenEnvelope, config, revealedIds, listenedIds, hasPlayedSequence } = useGift();

  const [currentTab, setCurrentTab] = useState<'garden' | 'letter'>('garden');
  const [selectedForPlayer, setSelectedForPlayer] = useState<Participant | null>(null);
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);

  const totalVoices = config.participants.length;
  const allDiscovered = totalVoices > 0 && revealedIds.length === totalVoices;
  const allListened = totalVoices > 0 && listenedIds.length === totalVoices;
  const canPlaySequence = allDiscovered && allListened;
  const canAccessFinalLetter = canPlaySequence && hasPlayedSequence;

  // Selección directa para abrir la ventana modal con el reproductor de voz
  const handleSelectParticipant = (participant: Participant) => {
    setSelectedForPlayer(participant);
  };

  // Navegación anterior / siguiente dentro del reproductor individual
  const currentParticipantIndex = selectedForPlayer
    ? config.participants.findIndex((p) => p.id === selectedForPlayer.id)
    : -1;

  const handleNavigatePlayer = (direction: 'prev' | 'next') => {
    if (currentParticipantIndex === -1) return;
    const nextIndex = direction === 'next' ? currentParticipantIndex + 1 : currentParticipantIndex - 1;
    if (nextIndex >= 0 && nextIndex < config.participants.length) {
      setSelectedForPlayer(config.participants[nextIndex]);
    }
  };

  // Escuchar todas las voces en secuencia (solo si ya descubrió y escuchó todos los audios individuales)
  const handleStartContinuousAll = () => {
    if (canPlaySequence) {
      setIsPodcastOpen(true);
    }
  };

  // Si aún no abrió el sobre de regalo, mostrar pantalla de bienvenida
  if (!hasSeenEnvelope) {
    return <WelcomeScreen onOpenGift={() => setCurrentTab('garden')} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF5F0] flex flex-col text-[#514344]">
      {/* Barra superior de navegación */}
      <Header
        currentTab={currentTab}
        onNavigateTab={(tab) => {
          if (tab === 'letter' && !canAccessFinalLetter) return;
          setCurrentTab(tab);
        }}
        onOpenContinuousMode={handleStartContinuousAll}
      />

      {/* Pantalla activa: Jardín o Carta Final */}
      <main className="flex-1">
        {currentTab === 'garden' ? (
          <GardenMapScreen
            onSelectParticipant={handleSelectParticipant}
            onOpenContinuousMode={handleStartContinuousAll}
            onOpenFinalLetter={() => {
              if (canAccessFinalLetter) {
                setCurrentTab('letter');
              }
            }}
          />
        ) : (
          <FinalLetterScreen
            onBackToGarden={() => setCurrentTab('garden')}
          />
        )}
      </main>

      {/* Pie de página discreto */}
      <footer className="border-t border-[#E8DDDA] py-6 text-center text-xs text-[#514344]/60 bg-[#FAF5F0]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{config.productName} · {config.productSubtitle}</span>
          <span>{config.edition}</span>
        </div>
      </footer>

      {/* Modal reproductor de voz individual con descubrimiento directo al reproducir */}
      <VoicePlayerModal
        participant={selectedForPlayer}
        onClose={() => setSelectedForPlayer(null)}
        onNavigateParticipant={handleNavigatePlayer}
        hasPrev={currentParticipantIndex > 0}
        hasNext={currentParticipantIndex < config.participants.length - 1}
      />

      {/* Modal de escucha continua de todas las voces */}
      {isPodcastOpen && (
        <PodcastModeModal
          onClose={() => setIsPodcastOpen(false)}
          onOpenFinalLetter={() => {
            setIsPodcastOpen(false);
            setCurrentTab('letter');
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <GiftProvider>
      <MainExperience />
    </GiftProvider>
  );
}
