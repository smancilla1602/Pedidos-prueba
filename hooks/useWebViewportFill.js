import { useEffect } from 'react';
import { Platform } from 'react-native';

const VIEWPORT_STYLE_ID = 'cdc-dynamic-viewport';

/**
 * En web `100vh` se mide con las barras del navegador ocultas (Safari iOS),
 * así que la app queda más alta que el área realmente visible y asoma
 * contenido (la fotografía) en la franja inferior. Forzamos html/body/#root
 * al viewport dinámico (`100dvh`) y pintamos el lienzo de la página con el
 * mismo color de la pantalla, de modo que ninguna zona muestre transparencia.
 *
 * Solo actúa en web; en iOS/Android es un no-op.
 */
function ensureDynamicViewportStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(VIEWPORT_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = VIEWPORT_STYLE_ID;
  style.textContent = `
    html,
    body,
    #root {
      height: 100dvh;
    }

    @supports not (height: 100dvh) {
      html,
      body,
      #root {
        height: 100%;
      }
    }

    /* Mismo reset que usa react-native-web, recolocado tras la regla anterior. */
    #root {
      display: flex;
      flex: 1;
    }
  `;

  document.head.appendChild(style);
}

export default function useWebViewportFill(backgroundColor) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    ensureDynamicViewportStyle();

    // El lienzo de la página queda detrás de la app: mismo color para que
    // ninguna franja del navegador deje ver blanco ni la fotografía.
    document.documentElement.style.backgroundColor = backgroundColor;
    document.body.style.backgroundColor = backgroundColor;
  }, [backgroundColor]);
}
