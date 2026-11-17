import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from '../components/BrandLogo';
import InlineNotice from '../components/InlineNotice';
import PrimaryButton from '../components/PrimaryButton';
import SegmentedControl from '../components/SegmentedControl';
import TextField from '../components/TextField';
import { useReducedMotion } from '../hooks/useReducedMotion';
import {
  colors,
  layout,
  motion,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '../theme';
import {
  hasErrors,
  validateApellido,
  validateCelular,
  validateEmail,
  validateEmpresaSucursal,
  validateLoginForm,
  validateNombre,
  validatePassword,
  validateSignUpForm,
} from '../utils/validation';

const MODES = [
  { value: 'login', label: 'Iniciar sesión' },
  { value: 'register', label: 'Crear cuenta' },
];

const INITIAL_VALUES = {
  nombre: '',
  apellido: '',
  email: '',
  celular: '',
  empresaSucursal: '',
  password: '',
};

const FIELD_VALIDATORS = {
  nombre: validateNombre,
  apellido: validateApellido,
  email: validateEmail,
  celular: validateCelular,
  empresaSucursal: validateEmpresaSucursal,
  password: validatePassword,
};

export default function AuthScreen({
  onSignIn,
  onSignUp,
  submitting,
  feedback,
  onClearFeedback,
}) {
  const [mode, setMode] = useState('login');
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const isWide = width >= 700;

  const scrollRef = useRef(null);
  const formProgress = useRef(new Animated.Value(1)).current;

  const nombreRef = useRef(null);
  const apellidoRef = useRef(null);
  const emailRef = useRef(null);
  const celularRef = useRef(null);
  const empresaRef = useRef(null);
  const passwordRef = useRef(null);

  const fieldRefs = {
    nombre: nombreRef,
    apellido: apellidoRef,
    email: emailRef,
    celular: celularRef,
    empresaSucursal: empresaRef,
    password: passwordRef,
  };

  const isLogin = mode === 'login';

  useEffect(() => {
    formProgress.setValue(0);
    Animated.timing(formProgress, {
      toValue: 1,
      duration: reducedMotion ? 0 : motion.base,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [mode, formProgress, reducedMotion]);

  const formAnimatedStyle = {
    opacity: formProgress,
    transform: [
      {
        translateY: formProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setErrors({});
    setPasswordVisible(false);
    onClearFeedback?.();
  };

  const handleChange = (field) => (text) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    onClearFeedback?.();

    setErrors((prev) => {
      if (!prev[field]) return prev;
      const nextError = FIELD_VALIDATORS[field](text);
      const next = { ...prev };
      if (nextError) next[field] = nextError;
      else delete next[field];
      return next;
    });
  };

  const handleBlur = (field) => () => {
    const nextError = FIELD_VALIDATORS[field](values[field]);
    setErrors((prev) => {
      const next = { ...prev };
      if (nextError) next[field] = nextError;
      else delete next[field];
      return next;
    });
  };

  // En Android el teclado reduce el área visible: acercamos los campos
  // finales para que nunca queden ocultos (iOS usa automaticallyAdjustKeyboardInsets).
  const handleFieldFocus = (field) => {
    if (Platform.OS !== 'android') return;
    if (field === 'empresaSucursal' || field === 'password') {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 220);
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    const nextErrors = isLogin ? validateLoginForm(values) : validateSignUpForm(values);
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      const firstInvalid = Object.keys(nextErrors)[0];
      const count = Object.keys(nextErrors).length;
      AccessibilityInfo.announceForAccessibility?.(
        `Revisa ${count === 1 ? 'un campo' : `${count} campos`} del formulario.`
      );
      fieldRefs[firstInvalid]?.current?.focus();
      return;
    }

    const result = isLogin
      ? await onSignIn({
          email: values.email,
          password: values.password,
        })
      : await onSignUp({
          nombre: values.nombre,
          apellido: values.apellido,
          email: values.email,
          celular: values.celular,
          empresaSucursal: values.empresaSucursal,
          password: values.password,
        });

    if (result?.ok) {
      if (!isLogin && result.needsEmailConfirmation) {
        // Sin sesión activa: llevamos al login con el correo ya escrito.
        setMode('login');
        setValues({ ...INITIAL_VALUES, email: values.email });
        setPasswordVisible(false);
      } else {
        setValues(INITIAL_VALUES);
        setPasswordVisible(false);
      }
      setErrors({});
      return;
    }

    if (result?.field) {
      const message = result.message;
      setErrors((prev) => ({ ...prev, [result.field]: message }));
      fieldRefs[result.field]?.current?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'web' ? undefined : 'padding'}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            isWide && styles.scrollContentWide,
          ]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.brandRow}>
              <View style={styles.logoChip}>
                <BrandLogo width={38} decorative />
              </View>
              <View style={styles.brandCopy}>
                <Text style={styles.brandName}>Cervecería de Colima</Text>
                <Text style={styles.brandCaption}>
                  El Trapiche · Cuauhtémoc, Colima
                </Text>
              </View>
            </View>

            <View style={styles.heading}>
              <Text accessibilityRole="header" style={styles.title}>
                {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? 'Accede para consultar tu perfil y la información de tu sucursal.'
                  : 'Completa tus datos para dar de alta tu acceso a la plataforma.'}
              </Text>
            </View>

            <View style={[styles.card, isWide && styles.cardWide]}>
              <SegmentedControl
                options={MODES}
                value={mode}
                onChange={handleModeChange}
              />

              <Animated.View style={[styles.form, formAnimatedStyle]}>
                {!isLogin ? (
                  <>
                    <TextField
                      ref={nombreRef}
                      label="Nombre"
                      required
                      icon="person-outline"
                      placeholder="María"
                      value={values.nombre}
                      onChangeText={handleChange('nombre')}
                      onBlur={handleBlur('nombre')}
                      onFocus={() => handleFieldFocus('nombre')}
                      error={errors.nombre}
                      autoCapitalize="words"
                      autoCorrect={false}
                      textContentType="givenName"
                      maxLength={60}
                      returnKeyType="next"
                      submitBehavior="submit"
                      onSubmitEditing={() => apellidoRef.current?.focus()}
                    />
                    <TextField
                      ref={apellidoRef}
                      label="Apellido"
                      required
                      icon="person-outline"
                      placeholder="Pérez"
                      value={values.apellido}
                      onChangeText={handleChange('apellido')}
                      onBlur={handleBlur('apellido')}
                      onFocus={() => handleFieldFocus('apellido')}
                      error={errors.apellido}
                      autoCapitalize="words"
                      autoCorrect={false}
                      textContentType="familyName"
                      maxLength={60}
                      returnKeyType="next"
                      submitBehavior="submit"
                      onSubmitEditing={() => emailRef.current?.focus()}
                    />
                  </>
                ) : null}

                <TextField
                  ref={emailRef}
                  label="Correo electrónico"
                  required
                  icon="mail-outline"
                  placeholder="nombre@empresa.com"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  onFocus={() => handleFieldFocus('email')}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  maxLength={120}
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() =>
                    (isLogin ? passwordRef : celularRef).current?.focus()
                  }
                />


                {!isLogin ? (
                  <>
                    <TextField
                      ref={celularRef}
                      label="Número de celular"
                      required
                      icon="call-outline"
                      placeholder="+52 312 123 4567"
                      value={values.celular}
                      onChangeText={handleChange('celular')}
                      onBlur={handleBlur('celular')}
                      onFocus={() => handleFieldFocus('celular')}
                      error={errors.celular}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      textContentType="telephoneNumber"
                      maxLength={18}
                      returnKeyType="next"
                      submitBehavior="submit"
                      onSubmitEditing={() => empresaRef.current?.focus()}
                    />
                    <TextField
                      ref={empresaRef}
                      label="Empresa / Sucursal"
                      required
                      icon="storefront-outline"
                      placeholder="Cervecería de Colima · El Trapiche"
                      value={values.empresaSucursal}
                      onChangeText={handleChange('empresaSucursal')}
                      onBlur={handleBlur('empresaSucursal')}
                      onFocus={() => handleFieldFocus('empresaSucursal')}
                      error={errors.empresaSucursal}
                      autoCapitalize="words"
                      autoCorrect={false}
                      maxLength={80}
                      returnKeyType="next"
                      submitBehavior="submit"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  </>
                ) : null}

                <TextField
                  ref={passwordRef}
                  label="Contraseña"
                  required
                  icon="lock-closed-outline"
                  placeholder="Mínimo 6 caracteres"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  onFocus={() => handleFieldFocus('password')}
                  error={errors.password}
                  helper={isLogin ? undefined : 'Usa al menos 6 caracteres.'}
                  secureTextEntry
                  secureTextVisible={passwordVisible}
                  onToggleSecure={() => setPasswordVisible((visible) => !visible)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  textContentType={isLogin ? 'password' : 'newPassword'}
                  maxLength={72}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                {feedback ? (
                  <InlineNotice
                    type={feedback.type}
                    title={feedback.title}
                    message={feedback.message}
                  />
                ) : null}

                <PrimaryButton
                  label={isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                  icon={isLogin ? 'log-in-outline' : 'person-add-outline'}
                  onPress={handleSubmit}
                  loading={submitting}
                  accessibilityHint={
                    isLogin
                      ? 'Valida tu correo y contraseña con Supabase'
                      : 'Crea tu cuenta con los datos del formulario'
                  }
                />
              </Animated.View>
            </View>

            <View style={styles.secureRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={sizes.iconSm}
                color={colors.textMuted}
              />
              <Text style={styles.secureText}>Conexión segura con Supabase</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.minHorizontalPadding,
    paddingVertical: spacing.xxxl,
  },
  scrollContentWide: {
    paddingHorizontal: layout.maxHorizontalPadding,
    paddingVertical: spacing.giant,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  logoChip: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCopy: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    ...typography.label,
    color: colors.primary,
    letterSpacing: 0.2,
  },
  brandCaption: {
    ...typography.caption,
    color: colors.textMuted,
  },
  heading: {
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: layout.cardPaddingCompact,
    ...shadows.card,
  },
  cardWide: {
    padding: layout.cardPaddingWide,
  },
  form: {
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  secureText: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 1,
    textAlign: 'center',
  },
});

