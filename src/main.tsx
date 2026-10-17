/**
 * ============================================================================
 * ARCHIVO: src/main.tsx
 * ============================================================================
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el punto de entrada de ejecución del frontend de React (Client Entry Point).
 *
 * ¿QUÉ CONTIENE?
 * - La inicialización del DOM virtual de React 19 mediante `createRoot`.
 * - La importación de la hoja de estilos global Tailwind CSS (`./index.css`).
 * - El montaje del componente raíz `<App />` en el nodo HTML `<div id="root">`.
 *
 * ¿CÓMO FUNCIONA?
 * Vite compila este archivo al arrancar el servidor de desarrollo (`npm run dev`)
 * o al construir la versión final para producción (`npm run build`). Se vincula
 * directamente desde el script en `/index.html`.
 *
 * PRECISIONES TÉCNICAS:
 * - Emplea React 19 con el nuevo modelo de renderizado concurrente (`createRoot`).
 * ============================================================================
 */

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
