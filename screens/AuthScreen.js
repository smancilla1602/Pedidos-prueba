import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from '../components/BrandLogo';
import InlineNotice from '../components/InlineNotice';
import PrimaryButton from '../components/PrimaryButton';
import SegmentedControl from '../components/SegmentedControl';
import TextField from '../components/TextField';
import { useReducedMotion } from '../hooks/useReducedMotion';
import useWebViewportFill from '../hooks/useWebViewportFill';
import {
  colors,
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

const COPY = {
  eyebrow: 'Cervecería de Colima',
  loginTitle: 'Tu cuenta',
  registerTitle: 'Nueva cuenta',
  loginLede: 'Entra con el correo de tu cuenta.',
  registerLede: 'Completa tus datos para abrirla.',
  fineprint: 'Conexión segura',
};

// Fotografía real de la marca (1200 × 1200 px): las seis botellas completas.
const BOTTLES_SOURCE = require('../assets/botellas-lineup.jpg');

// Composición diagonal: el lienzo recorta la fotografía y la tarjeta blanca
// sube 40 px sobre el corte. Las botellas ocupan el 66% central del original.
const SHEET_OVERLAP = 40;
const HERO_TILT = '7deg';
const BADGE_SIZE = 76;
const PHOTO_SUBJECT_RATIO = 0.66;

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
  const [stackedContentHeight, setStackedContentHeight] = useState(0);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  // Escritorio horizontal: fotografía a sangre con corte diagonal y tarjeta
  // flotante a la derecha. Móvil y tablet conservan la lectura vertical.
  const isWide = width >= 1024 && width > height;
  const isPhone = width < 600;
  const isCompact = height < 720;

  useWebViewportFill(colors.background);

  // Franja fotográfica del layout apilado. En tablet hay más altura: la foto
  // crece para que las botellas no queden pequeñas sobre el lienzo.
  const heroRatio = isPhone ? (isCompact ? 0.32 : 0.38) : 0.44;
  const heroHeight = Math.round(
    Math.min(Math.max(height * heroRatio, 240), 620)
  );
  const sheetTop = heroHeight - SHEET_OVERLAP;
  const cutTop = sheetTop - 34;

  // En tablet la tarjeta flota con la altura justa de su contenido (la de
  // móvil se ancla al pie). Si el formulario crece, se limita al viewport.
  const stackedTopPadding = isCompact ? 46 : 54;
  const availableSheetHeight = Math.max(
    280,
    height - sheetTop - Math.max(insets.bottom, spacing.lg)
  );
  const tabletSheetHeight = stackedContentHeight
    ? Math.min(
        availableSheetHeight,
        stackedContentHeight + stackedTopPadding + spacing.xxl
      )
    : availableSheetHeight;

  // La fotografía no se deforma ni se estira: se dibuja cuadrada y la franja
  // la recorta sobre el bloque de botellas, nunca sobre el cielo o la mesa.
  const photoPlateWidth = Math.min(width, heroHeight / PHOTO_SUBJECT_RATIO);
  const photoPlateLeft = (width - photoPlateWidth) / 2;
  const photoPlateOffset = Math.max(
    0,
    Math.min(photoPlateWidth * 0.24, photoPlateWidth - heroHeight)
  );

  // En escritorio la fotografía ocupa el alto completo y la tarjeta flota
  // sobre el lienzo diagonal que recorta su borde derecho.
  const widePhotoWidth = Math.min(width, height * 1.12);
  const widePhotoOffset = Math.max(
    0,
    Math.min(widePhotoWidth * 0.24, widePhotoWidth - height)
  );
  const wideCardWidth = Math.min(
    440,
    Math.max(360, width * 0.33),
    width - spacing.mega - spacing.huge
  );

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
    AccessibilityInfo.announceForAccessibility?.(
      nextMode === 'login'
        ? 'Formulario para iniciar sesión.'
        : 'Formulario para crear una cuenta.'
    );
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
  // finales para que nunca queden ocultos.
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

  // Campos sin iconos decorativos: etiqueta visible, una sola lectura y el
  // ojo de contraseña como único adorno (44 × 44 px).
  const fields = {
    nombre: (
      <TextField
        ref={nombreRef}
        label="Nombre"
        required
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
    ),
    apellido: (
      <TextField
        ref={apellidoRef}
        label="Apellido"
        required
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
    ),
    email: (
      <TextField
        ref={emailRef}
        label="Correo electrónico"
        required
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
    ),
    celular: (
      <TextField
        ref={celularRef}
        label="Número de celular"
        required
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
    ),
    empresa: (
      <TextField
        ref={empresaRef}
        label="Empresa o sucursal"
        required
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
    ),
    password: (
      <TextField
        ref={passwordRef}
        label="Contraseña"
        required
        placeholder="Tu contraseña"
        value={values.password}
        onChangeText={handleChange('password')}
        onBlur={handleBlur('password')}
        onFocus={() => handleFieldFocus('password')}
        error={errors.password}
        helper={isLogin ? undefined : 'Mínimo 6 caracteres.'}
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
    ),
  };

  const renderForm = () => (
    <Animated.View
      style={[styles.form, isCompact && styles.formCompact, formAnimatedStyle]}
    >
      {!isLogin ? (
        isWide ? (
          <View style={styles.fieldRow}>
            <View style={styles.fieldCol}>{fields.nombre}</View>
            <View style={styles.fieldCol}>{fields.apellido}</View>
          </View>
        ) : (
          <>
            {fields.nombre}
            {fields.apellido}
          </>
        )
      ) : null}

      {isWide && !isLogin ? (
        <View style={styles.fieldRow}>
          <View style={styles.fieldCol}>{fields.email}</View>
          <View style={styles.fieldCol}>{fields.celular}</View>
        </View>
      ) : (
        <>
          {fields.email}
          {!isLogin ? fields.celular : null}
        </>
      )}

      {!isLogin ? fields.empresa : null}

      {fields.password}

      {feedback ? (
        <InlineNotice
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
        />
      ) : null}

      <PrimaryButton
        label={isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
        icon="arrow-forward"
        iconPosition="right"
        onPress={handleSubmit}
        loading={submitting}
        style={styles.submit}
        accessibilityHint={
          isLogin
            ? 'Valida tu correo y contraseña'
            : 'Crea tu cuenta con los datos del formulario'
        }
      />

      {isCompact ? null : (
        <View style={styles.fineprint}>
          <Ionicons
            name="shield-checkmark-outline"
            size={sizes.iconSm}
            color={colors.textMuted}
          />
          <Text style={styles.fineprintText}>{COPY.fineprint}</Text>
        </View>
      )}
    </Animated.View>
  );

  const badge = (
    <View style={styles.badge} accessible={false}>
      <BrandLogo width={44} decorative />
    </View>
  );

  const renderAuthContent = (variant) => (
    <View
      style={[styles.content, isCompact && styles.contentCompact]}
      onLayout={
        !isWide && !isPhone
          ? (event) => {
              const nextHeight = Math.round(event.nativeEvent.layout.height);
              setStackedContentHeight((current) =>
                current === nextHeight ? current : nextHeight
              );
            }
          : undefined
      }
    >
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>{COPY.eyebrow}</Text>
        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            variant === 'wide' && styles.titleWide,
            isCompact && variant !== 'wide' && styles.titleCompact,
          ]}
        >
          {isLogin ? COPY.loginTitle : COPY.registerTitle}
        </Text>
        <Text style={[styles.lede, isCompact && styles.ledeCompact]}>
          {isLogin ? COPY.loginLede : COPY.registerLede}
        </Text>
      </View>

      <SegmentedControl
        options={MODES}
        value={mode}
        onChange={handleModeChange}
      />

      {renderForm()}
    </View>
  );

  if (!isWide) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />

        {/* Fotografía con corte diagonal de lienzo */}
        <View style={[styles.hero, { height: heroHeight }]}>
          <View
            style={[
              styles.photoPlate,
              {
                width: photoPlateWidth,
                height: photoPlateWidth,
                left: photoPlateLeft,
                top: -photoPlateOffset,
              },
            ]}
          >
            <Image
              source={BOTTLES_SOURCE}
              style={styles.photoImage}
              resizeMode="cover"
              accessible={false}
            />
          </View>

          <View
            pointerEvents="none"
            style={[
              styles.heroCut,
              {
                width: width * 2,
                height: heroHeight + 440,
                left: -width / 2,
                top: cutTop,
              },
            ]}
          />
        </View>

        {/* Tarjeta blanca que asciende sobre el corte */}
        <KeyboardAvoidingView
          style={[
            styles.sheetLayer,
            !isPhone && styles.sheetLayerTablet,
            !isPhone && { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : Platform.OS === 'android'
                ? 'height'
                : undefined
          }
        >
          <View
            style={[
              styles.sheetFrame,
              isPhone && styles.sheetFramePhone,
              !isPhone && styles.sheetFrameTablet,
              !isPhone && {
                width: Math.min(600, width - spacing.xxxl),
                height: tabletSheetHeight,
              },
            ]}
          >
            <View style={[styles.sheetClip, !isPhone && styles.sheetClipTablet]}>
              <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={[
                  styles.sheetContent,
                  isCompact && styles.sheetContentCompact,
                  {
                    paddingLeft: isPhone
                      ? Math.max(insets.left, spacing.xxl)
                      : spacing.xxxl,
                    paddingRight: isPhone
                      ? Math.max(insets.right, spacing.xxl)
                      : spacing.xxxl,
                    paddingBottom: isPhone
                      ? Math.max(insets.bottom, spacing.xxl)
                      : spacing.xxl,
                  },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {renderAuthContent('stacked')}
              </ScrollView>
            </View>

            <View pointerEvents="none" style={styles.badgeWrap}>
              {badge}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.wideRoot}>
      <StatusBar style="dark" />

      <View
        style={[
          styles.widePhoto,
          { width: widePhotoWidth, height: widePhotoWidth, top: -widePhotoOffset },
        ]}
      >
        <Image
          source={BOTTLES_SOURCE}
          style={styles.photoImage}
          resizeMode="cover"
          accessible={false}
        />
      </View>

      {/* Lienzo que entra en diagonal sobre la fotografía */}
      <View
        pointerEvents="none"
        style={[
          styles.wideCut,
          {
            width: width * 0.44,
            height: height + 800,
            top: -400,
            right: -width * 0.12,
          },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.wideContent,
            {
              paddingLeft: Math.max(insets.left, spacing.huge),
              paddingRight: Math.max(insets.right + spacing.huge, spacing.mega),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.wideCardWrap, { width: wideCardWidth }]}>
            <View style={styles.wideCard}>
              <View pointerEvents="none" style={styles.badgeWrapWide}>
                {badge}
              </View>
              {renderAuthContent('wide')}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },

  // Franja fotográfica y corte diagonal (móvil y tablet)
  hero: {
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  photoPlate: {
    position: 'absolute',
  },
  photoImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroCut: {
    position: 'absolute',
    backgroundColor: colors.background,
    transform: [{ rotate: HERO_TILT }],
  },

  // Tarjeta blanca que asciende sobre el corte
  sheetLayer: {
    flex: 1,
    marginTop: -SHEET_OVERLAP,
    zIndex: 2,
  },
  sheetLayerTablet: {
    paddingHorizontal: spacing.lg,
  },
  sheetFrame: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    ...shadows.sheet,
  },
  sheetFramePhone: {
    flex: 1,
  },
  sheetFrameTablet: {
    alignSelf: 'center',
    maxHeight: '100%',
    borderRadius: radii.xxl,
    ...shadows.raised,
  },
  sheetClip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    overflow: 'hidden',
  },
  sheetClipTablet: {
    borderRadius: radii.xxl,
  },
  scroll: {
    flex: 1,
  },
  sheetContent: {
    paddingTop: 54,
  },
  sheetContentCompact: {
    paddingTop: 46,
  },
  badgeWrap: {
    position: 'absolute',
    top: -BADGE_SIZE / 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  badgeWrapWide: {
    position: 'absolute',
    top: -BADGE_SIZE / 2,
    left: spacing.xxl,
    zIndex: 3,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.pill,
  },

  // Contenido editorial
  content: {
    gap: spacing.lg + 2,
  },
  contentCompact: {
    gap: spacing.md + 2,
  },
  headerBlock: {
    gap: 6,
  },
  eyebrow: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  title: {
    ...typography.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.7,
    color: colors.textPrimary,
  },
  titleWide: {
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.9,
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 34,
  },
  lede: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  ledeCompact: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Formulario compacto: una sola retícula, sin cajas dentro de cajas
  form: {
    gap: spacing.md,
  },
  formCompact: {
    gap: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fieldCol: {
    flex: 1,
  },
  submit: {
    minHeight: 52,
    borderRadius: radii.md,
  },
  fineprint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  fineprintText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },

  // Escritorio: foto a sangre, lienzo diagonal y tarjeta flotante
  wideRoot: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  widePhoto: {
    position: 'absolute',
    left: 0,
  },
  wideCut: {
    position: 'absolute',
    backgroundColor: colors.background,
    transform: [{ rotate: '5deg' }],
  },
  wideContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: spacing.huge,
  },
  wideCardWrap: {
    position: 'relative',
  },
  wideCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.xxxl,
    paddingTop: 54,
    paddingBottom: spacing.xxxl,
    ...shadows.raised,
  },
});







