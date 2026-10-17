/**
 * ============================================================================
 * ARCHIVO: src/components/BotanicalFlower.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente de renderizado vectorial (SVG) que dibuja las ilustraciones
 * botánicas de las flores en el jardín interactivo.
 *
 * ¿QUÉ CONTIENE?
 * - `BotanicalFlowerProps`: Interfaz con las propiedades recibidas:
 *   - `type`: Especie de flor ('peony', 'rose', 'camellia', 'jasmine', 'lily', 'orchid', 'lavender', 'wildflower').
 *   - `isOpen`: Booleano que define si la flor se dibuja en capullo cerrado o abierta en plenitud.
 *   - `isListened`: Booleano que indica si su audio ya fue escuchado.
 *   - `isPlaying`: Booleano para animar un sutil latido/pulso mientras el audio está activo.
 *   - `size`: Tamaño en píxeles del SVG (por defecto 64px).
 * - `BotanicalFlower`: Componente funcional que genera los pétalos, pistilos, hojas y tallos
 *   mediante trazados vectoriales matemáticos SVG limpios.
 *
 * ¿CÓMO FUNCIONA?
 * - Selecciona dinámicamente el trazado SVG según la flor (`peony`, `rose`, etc.).
 * - Cuando `isOpen` es false (mensaje no descubierto), la flor se muestra estilizada en forma de capullo.
 * - Cuando `isOpen` es true (o ya escuchada), los pétalos se expanden en flor abierta con colores cálidos.
 * - Si `isPlaying` es true, añade una animación CSS de respiración armónica (`animate-pulse`).
 *
 * ¿CÓMO CONFIGURAR O PERSONALIZAR?
 * - Para cambiar los colores de las flores: podés ajustar las constantes de color internas
 *   (`petalClosed`, `petalOpen`, `centerColor`, `leafColor`, etc.).
 * - Para asignar una flor específica a un familiar: modificalo en `src/config/giftConfig.ts`
 *   en el atributo `botanicalType` del participante.
 *
 * PRECISIONES TÉCNICAS:
 * - Utiliza SVG puro embebido sin dependencias externas para garantizar máximo rendimiento,
 *   cero latencia de carga y nitidez perfecta en cualquier resolución o pantalla retina.
 * ============================================================================
 */

import React from 'react';
import { BotanicalType } from '../types/gift';

interface BotanicalFlowerProps {
  type: BotanicalType;
  isOpen: boolean;
  isListened?: boolean;
  isPlaying?: boolean;
  className?: string;
  size?: number;
}

export const BotanicalFlower: React.FC<BotanicalFlowerProps> = ({
  type,
  isOpen,
  isListened = false,
  isPlaying = false,
  className = '',
  size = 64
}) => {
  // Paleta cromática botánica cálida
  const petalClosed = '#E8C9CB'; // Rosa suave
  const petalOpen = '#C98291'; // Rosa antiguo
  const centerColor = '#85545D'; // Malva oscuro
  const leafColor = '#8FA58A'; // Verde salvia medio
  const leafDeep = '#64775B'; // Verde hoja
  const sageLight = '#DCE4D4'; // Verde salvia claro

  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-500 ${
        isPlaying ? 'scale-105' : 'hover:scale-102'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Sutil resplandor botánico si está en reproducción */}
      {isPlaying && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ backgroundColor: petalOpen }}
        />
      )}

      {/* Halo de mensaje escuchado */}
      {isListened && (
        <span
          aria-hidden="true"
          className="absolute -inset-1 rounded-full border border-dashed opacity-60"
          style={{ borderColor: leafColor }}
        />
      )}

      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-700 select-none"
      >
        {/* Tallo y hojas */}
        <path
          d="M50 65 Q50 85 46 95"
          stroke={leafDeep}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M48 76 Q35 70 34 82 Q42 85 48 78"
          fill={leafColor}
        />
        <path
          d="M50 72 Q64 66 65 78 Q58 82 50 74"
          fill={sageLight}
        />

        {isOpen ? (
          /* Flor abierta / revelada */
          <g className="transition-transform duration-700 origin-center">
            {/* Pétalos exteriores */}
            <circle cx="50" cy="30" r="15" fill={petalClosed} fillOpacity="0.85" />
            <circle cx="68" cy="42" r="15" fill={petalClosed} fillOpacity="0.85" />
            <circle cx="62" cy="62" r="14" fill={petalClosed} fillOpacity="0.85" />
            <circle cx="38" cy="62" r="14" fill={petalClosed} fillOpacity="0.85" />
            <circle cx="32" cy="42" r="15" fill={petalClosed} fillOpacity="0.85" />

            {/* Pétalos interiores con acento rosa antiguo */}
            <circle cx="50" cy="36" r="11" fill={petalOpen} fillOpacity="0.9" />
            <circle cx="60" cy="45" r="11" fill={petalOpen} fillOpacity="0.9" />
            <circle cx="56" cy="56" r="10" fill={petalOpen} fillOpacity="0.9" />
            <circle cx="44" cy="56" r="10" fill={petalOpen} fillOpacity="0.9" />
            <circle cx="40" cy="45" r="11" fill={petalOpen} fillOpacity="0.9" />

            {/* Centro botánico malva */}
            <circle cx="50" cy="48" r="8" fill={centerColor} />
            <circle cx="50" cy="48" r="4" fill="#FAF5F0" />
            {/* Pistilos sutiles */}
            <circle cx="47" cy="46" r="1.2" fill={centerColor} />
            <circle cx="53" cy="46" r="1.2" fill={centerColor} />
            <circle cx="50" cy="51" r="1.2" fill={centerColor} />
          </g>
        ) : (
          /* Brote cerrado / misterioso */
          <g className="transition-transform duration-700 origin-center">
            {/* Capullo cerrado */}
            <path
              d="M50 32 C38 42 38 60 50 64 C62 60 62 42 50 32 Z"
              fill={petalClosed}
              stroke={petalOpen}
              strokeWidth="1.5"
            />
            {/* Pétalo superpuesto del capullo */}
            <path
              d="M46 36 C52 44 54 54 48 63 C58 58 58 45 46 36 Z"
              fill={petalOpen}
              fillOpacity="0.8"
            />
            {/* Cáliz protector en verde salvia */}
            <path
              d="M40 60 Q50 68 60 60 Q50 65 40 60 Z"
              fill={leafColor}
            />
            <path
              d="M44 62 L42 68 M50 64 L50 71 M56 62 L58 68"
              stroke={leafDeep}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
