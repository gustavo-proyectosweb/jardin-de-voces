/**
 * ============================================================================
 * ARCHIVO: vite.config.ts
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el archivo de configuración del empaquetador y servidor de desarrollo Vite.
 *
 * ¿QUÉ CONTIENE?
 * - Integración del plugin de React (`@vitejs/plugin-react`).
 * - Integración oficial del plugin de Tailwind CSS v4 (`@tailwindcss/vite`).
 * - Alias de rutas `@` apuntando al directorio raíz del proyecto.
 * - Configuración del servidor de desarrollo local (puerto 3000, host 0.0.0.0).
 *
 * ¿CÓMO FUNCIONA?
 * Procesa los módulos TypeScript, compila el código JSX en tiempo real y gestiona
 * el empaquetado optimizado para producción (`dist/`).
 *
 * PRECISIONES TÉCNICAS:
 * - El servidor corre en el puerto 3000.
 * - Incluye directivas de compatibilidad con AI Studio para el control de HMR.
 * ============================================================================
 */

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
