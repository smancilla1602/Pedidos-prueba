import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { normalizeEmail } from '../utils/validation';

/**
 * Traduce los mensajes de Supabase Auth a español y, cuando aplica,
 * indica qué campo del formulario debe mostrar el error inline.
 */
const AUTH_ERROR_RULES = [
  {
    pattern: /invalid login credentials/i,
    message: 'El correo o la contraseña no son correctos. Verifica tus datos.',
    field: 'password',
  },
  {
    pattern: /email not confirmed/i,
    message: 'Confirma tu correo electrónico antes de iniciar sesión.',
    field: 'email',
  },
  {
    pattern: /user already registered|already been registered/i,
    message: 'Ya existe una cuenta con este correo electrónico.',
    field: 'email',
  },
  {
    pattern: /password should be at least|weak password/i,
    message: 'La contraseña debe tener al menos 6 caracteres.',
    field: 'password',
  },
  {
    pattern: /invalid email|email address.*invalid/i,
    message: 'El correo electrónico no es válido.',
    field: 'email',
  },
  {
    pattern: /rate limit|too many requests|over_email_send_rate_limit/i,
    message: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
    field: null,
  },
  {
    pattern: /signups? (are )?(not allowed|disabled)|signup is disabled/i,
    message: 'El registro está deshabilitado en este proyecto de Supabase.',
    field: null,
  },
  {
    pattern: /network request failed|failed to fetch|fetch failed|timed out/i,
    message: 'No pudimos conectar con el servidor. Revisa tu conexión a internet.',
    field: null,
  },
];

function translateAuthError(error) {
  const rawMessage = error?.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  const rule = AUTH_ERROR_RULES.find(({ pattern }) => pattern.test(rawMessage));
  if (rule) return { message: rule.message, field: rule.field };
  return { message: rawMessage, field: null };
}

/**
 * Estado y acciones de autenticación con Supabase.
 *
 * El registro guarda la información del perfil en `user_metadata`
 * (options.data) para poder mostrarla en la pantalla de Sesión Activa.
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMountedRef.current) return;
        if (error) {
          setFeedback({
            type: 'error',
            title: 'No pudimos recuperar tu sesión',
            message: 'Vuelve a iniciar sesión para continuar.',
          });
        }
        setSession(data?.session ?? null);
      } catch (error) {
        if (isMountedRef.current) {
          const translated = translateAuthError(error);
          setFeedback({
            type: 'error',
            title: 'No pudimos recuperar tu sesión',
            message: translated.message,
          });
        }
      } finally {
        if (isMountedRef.current) setInitializing(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMountedRef.current) return;
      setSession(nextSession ?? null);
      setInitializing(false);
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  const signIn = useCallback(async ({ email, password }) => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });

      if (error) {
        const translated = translateAuthError(error);
        if (isMountedRef.current) {
          setFeedback({
            type: 'error',
            title: 'No pudimos iniciar sesión',
            message: translated.message,
          });
        }
        return { ok: false, ...translated };
      }

      return { ok: true };
    } catch (error) {
      const translated = translateAuthError(error);
      if (isMountedRef.current) {
        setFeedback({
          type: 'error',
          title: 'No pudimos iniciar sesión',
          message: translated.message,
        });
      }
      return { ok: false, ...translated };
    } finally {
      if (isMountedRef.current) setSubmitting(false);
    }
  }, []);

  const signUp = useCallback(
    async ({ nombre, apellido, email, celular, empresaSucursal, password }) => {
      setSubmitting(true);
      setFeedback(null);

      const cleanEmail = normalizeEmail(email);
      const profile = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        celular: celular.trim(),
        empresa_sucursal: empresaSucursal.trim(),
      };

      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            // Perfil en user_metadata: visible en Sesión Activa y en Supabase.
            data: profile,
          },
        });

        if (error) {
          const translated = translateAuthError(error);
          if (isMountedRef.current) {
            setFeedback({
              type: 'error',
              title: 'No pudimos crear tu cuenta',
              message: translated.message,
            });
          }
          return { ok: false, ...translated };
        }

        const needsEmailConfirmation = Boolean(data?.user && !data?.session);

        if (isMountedRef.current) {
          setFeedback(
            needsEmailConfirmation
              ? {
                  type: 'success',
                  title: 'Confirma tu correo',
                  message: `Te enviamos un enlace de confirmación a ${cleanEmail}. Ábrelo para activar tu cuenta y después inicia sesión.`,
                }
              : {
                  type: 'success',
                  title: 'Cuenta creada',
                  message: 'Tu cuenta ya está activa. Te damos la bienvenida a Cervecería de Colima.',
                }
          );
        }

        return {
          ok: true,
          needsEmailConfirmation,
          user: data?.user ?? null,
        };
      } catch (error) {
        const translated = translateAuthError(error);
        if (isMountedRef.current) {
          setFeedback({
            type: 'error',
            title: 'No pudimos crear tu cuenta',
            message: translated.message,
          });
        }
        return { ok: false, ...translated };
      } finally {
        if (isMountedRef.current) setSubmitting(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        const translated = translateAuthError(error);
        if (isMountedRef.current) {
          setFeedback({
            type: 'error',
            title: 'No pudimos cerrar sesión',
            message: translated.message,
          });
        }
        return { ok: false, ...translated };
      }
      return { ok: true };
    } catch (error) {
      const translated = translateAuthError(error);
      if (isMountedRef.current) {
        setFeedback({
          type: 'error',
          title: 'No pudimos cerrar sesión',
          message: translated.message,
        });
      }
      return { ok: false, ...translated };
    } finally {
      if (isMountedRef.current) setSubmitting(false);
    }
  }, []);


  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.user),
    initializing,
    submitting,
    feedback,
    clearFeedback,
    signIn,
    signUp,
    signOut,
  };
}

export default useAuth;

