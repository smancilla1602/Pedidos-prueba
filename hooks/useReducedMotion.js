import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Respeta la preferencia del sistema de "reducir movimiento".
 * Usado por el splash y las transiciones para no generar animaciones
 * incómodas (SKILL prioridad 7: no-reduced-motion es anti-patrón).
 */
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let active = true;

    if (typeof AccessibilityInfo.isReduceMotionEnabled === 'function') {
      AccessibilityInfo.isReduceMotionEnabled()
        .then((enabled) => {
          if (active) setReducedMotion(Boolean(enabled));
        })
        .catch(() => {});
    }

    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      (enabled) => setReducedMotion(Boolean(enabled))
    );

    return () => {
      active = false;
      subscription?.remove?.();
    };
  }, []);

  return reducedMotion;
}

export default useReducedMotion;
