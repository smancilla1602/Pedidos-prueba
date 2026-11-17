import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BrandLogo from '../components/BrandLogo';
import { useReducedMotion } from '../hooks/useReducedMotion';
import useWebViewportFill from '../hooks/useWebViewportFill';
import { colors, motion, radii, sizes, spacing, typography } from '../theme';
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

// La fotografía se muestra completa: el marco cuadrado se escala a la
// dimensión mayor del panel y solo se recorta el fondo, nunca las botellas.
const LOGO_WIDTH = 88;
const FADE_SIZE = 88;
const EDGE_FADE = 56;
const HERO_FADE = 24;
const WIDE_BREAKPOINT = 760;
const FORM_MAX_WIDTH = 424;

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
  const [focusedField, setFocusedField] = useState(null);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  // Escritorio horizontal: fotografía a sangre a la izquierda y formulario a
  // la derecha sobre el lienzo crema. Móvil y tablet conservan la lectura
  // vertical con la foto arriba.
  const isWide = width >= WIDE_BREAKPOINT && width > height;
  const isCompact = height < 720;

  useWebViewportFill(colors.background);

  // Franja fotográfica: 90% del alto de la foto cuadrada, sin ampliarla más
  // allá de su ancho natural. La imagen arranca bajo la barra de estado para
  // que el encuadre se vea completo y el logo descanse sobre el cielo claro.
  const heroHeight = Math.round(Math.min(Math.max(width * 0.9, 220), 900));
  const heroPlateSize = width;
  const heroPlateTop = insets.top;
  const logoWidth = isWide
    ? LOGO_WIDTH
    : Math.min(64, Math.round(heroPlateSize * 0.17));

  // En escritorio la foto ocupa el 52% del ancho y el formulario se centra en
  // la mitad restante. El marco cuadrado se ajusta al ancho del panel para no
  // ampliar la imagen más allá de su resolución nativa.
  const widePhotoWidth = Math.round(width * 0.52);
  const widePlateSize = widePhotoWidth;
  const widePlateTop = (height - widePlateSize) / 2;
  const wideFadeWidth = Math.min(FADE_SIZE, widePhotoWidth * 0.16);
  const wideTopFade = Math.max(0, widePlateTop);
  const wideBottomFade = Math.min(
    height - EDGE_FADE,
    wideTopFade + widePlateSize - EDGE_FADE
  );
  const wideFormWidth = width - widePhotoWidth;

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

  // Campos con etiqueta visible y línea inferior: una sola lectura, sin cajas
  // ni iconos decorativos. El ojo de contraseña conserva 48 × 48 px.
  const FIELD_CONFIG = {
    nombre: {
      label: 'Nombre',
      required: true,
      placeholder: 'María',
      autoCapitalize: 'words',
      autoCorrect: false,
      textContentType: 'givenName',
      maxLength: 60,
      returnKeyType: 'next',
      submitBehavior: 'submit',
      onSubmitEditing: () => apellidoRef.current?.focus(),
    },
    apellido: {
      label: 'Apellido',
      required: true,
      placeholder: 'Pérez',
      autoCapitalize: 'words',
      autoCorrect: false,
      textContentType: 'familyName',
      maxLength: 60,
      returnKeyType: 'next',
      submitBehavior: 'submit',
      onSubmitEditing: () => emailRef.current?.focus(),
    },
    email: {
      label: 'Correo electrónico',
      required: true,
      placeholder: 'nombre@empresa.com',
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      autoCorrect: false,
      autoComplete: 'email',
      textContentType: 'emailAddress',
      maxLength: 120,
      returnKeyType: 'next',
      submitBehavior: 'submit',
      onSubmitEditing: () =>
        (isLogin ? passwordRef : celularRef).current?.focus(),
    },
    celular: {
      label: 'Número de celular',
      required: true,
      placeholder: '+52 312 123 4567',
      keyboardType: 'phone-pad',
      autoComplete: 'tel',
      textContentType: 'telephoneNumber',
      maxLength: 18,
      returnKeyType: 'next',
      submitBehavior: 'submit',
      onSubmitEditing: () => empresaRef.current?.focus(),
    },
    empresaSucursal: {
      label: 'Empresa o sucursal',
      required: true,
      placeholder: 'Cervecería de Colima · El Trapiche',
      autoCapitalize: 'words',
      autoCorrect: false,
      maxLength: 80,
      returnKeyType: 'next',
      submitBehavior: 'submit',
      onSubmitEditing: () => passwordRef.current?.focus(),
    },
    password: {
      label: 'Contraseña',
      required: true,
      placeholder: 'Tu contraseña',
      helper: isLogin ? undefined : 'Mínimo 6 caracteres.',
      secure: true,
      autoCapitalize: 'none',
      autoCorrect: false,
      autoComplete: isLogin ? 'current-password' : 'new-password',
      textContentType: isLogin ? 'password' : 'newPassword',
      maxLength: 72,
      returnKeyType: 'done',
      onSubmitEditing: handleSubmit,
    },
  };

  const renderField = (name) => {
    const { label, required, placeholder, helper, secure, ...inputProps } =
      FIELD_CONFIG[name];
    const fieldError = errors[name];
    const isFocused = focusedField === name;

    return (
      <View key={name} style={styles.field}>
        <Text
          style={[
            styles.fieldLabel,
            isFocused && !fieldError && styles.fieldLabelFocused,
          ]}
        >
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>

        <View style={styles.inputWrap}>
          <TextInput
            ref={fieldRefs[name]}
            style={[styles.input, !secure && styles.inputPlain]}
            value={values[name]}
            onChangeText={handleChange(name)}
            onFocus={() => {
              setFocusedField(name);
              handleFieldFocus(name);
            }}
            onBlur={(event) => {
              setFocusedField(null);
              handleBlur(name)(event);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.brandAccent}
            cursorColor={colors.primary}
            underlineColorAndroid="transparent"
            secureTextEntry={secure ? !passwordVisible : false}
            accessibilityLabel={`${label}${required ? ', obligatorio' : ''}`}
            accessibilityHint={fieldError ?? helper}
            {...inputProps}
          />

          {secure ? (
            <Pressable
              onPress={() => setPasswordVisible((visible) => !visible)}
              accessibilityRole="button"
              accessibilityLabel={
                passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
              accessibilityHint="Alterna la visibilidad del texto de la contraseña"
              hitSlop={4}
              style={({ pressed }) => [
                styles.passwordToggle,
                pressed && styles.pressedSoft,
              ]}
            >
              <Ionicons
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={sizes.iconMd}
                color={colors.primary}
              />
            </Pressable>
          ) : null}

          <View pointerEvents="none" style={styles.fieldLineTrack}>
            <View
              style={[
                styles.fieldLine,
                isFocused && !fieldError && styles.fieldLineFocused,
                fieldError && styles.fieldLineError,
              ]}
            />
          </View>
        </View>

        {fieldError ? (
          <View style={styles.fieldErrorRow} accessibilityLiveRegion="polite">
            <Ionicons
              name="alert-circle"
              size={sizes.iconSm}
              color={colors.error}
            />
            <Text style={styles.fieldErrorText}>{fieldError}</Text>
          </View>
        ) : helper ? (
          <Text style={styles.fieldHelper}>{helper}</Text>
        ) : null}
      </View>
    );
  };

  const renderForm = () => {
    let body;

    if (isLogin) {
      body = (
        <>
          {renderField('email')}
          {renderField('password')}
        </>
      );
    } else if (isWide && wideFormWidth >= 480) {
      body = (
        <>
          <View style={styles.fieldRow}>
            <View style={styles.fieldCol}>{renderField('nombre')}</View>
            <View style={styles.fieldCol}>{renderField('apellido')}</View>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.fieldCol}>{renderField('email')}</View>
            <View style={styles.fieldCol}>{renderField('celular')}</View>
          </View>
          {renderField('empresaSucursal')}
          {renderField('password')}
        </>
      );
    } else {
      body = (
        <>
          {renderField('nombre')}
          {renderField('apellido')}
          {renderField('email')}
          {renderField('celular')}
          {renderField('empresaSucursal')}
          {renderField('password')}
        </>
      );
    }

    const noticeType = feedback?.type;
    const noticeContainer =
      noticeType === 'error'
        ? styles.noticeError
        : noticeType === 'success'
          ? styles.noticeSuccess
          : styles.noticeInfo;
    const noticeText =
      noticeType === 'error'
        ? styles.noticeTextError
        : noticeType === 'success'
          ? styles.noticeTextSuccess
          : styles.noticeTextInfo;

    return (
      <Animated.View
        style={[styles.form, isCompact && styles.formCompact, formAnimatedStyle]}
      >
        {body}

        {feedback ? (
          <View
            style={[styles.notice, noticeContainer]}
            accessibilityRole={noticeType === 'error' ? 'alert' : undefined}
            accessibilityLiveRegion="polite"
          >
            {feedback.title ? (
              <Text style={[styles.noticeTitle, noticeText]}>
                {feedback.title}
              </Text>
            ) : null}
            {feedback.message ? (
              <Text style={[styles.noticeMessage, noticeText]}>
                {feedback.message}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel={isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          accessibilityHint={
            isLogin
              ? 'Valida tu correo y contraseña'
              : 'Crea tu cuenta con los datos del formulario'
          }
          accessibilityState={{ disabled: submitting, busy: submitting }}
          style={({ pressed }) => [
            styles.submit,
            pressed && !submitting && styles.submitPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.textOnAction} />
          ) : (
            <Text style={styles.submitLabel}>
              {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </Text>
          )}
        </Pressable>

        {isCompact ? null : (
          <Text style={styles.fineprint}>{COPY.fineprint}</Text>
        )}
      </Animated.View>
    );
  };

  const renderAuthContent = (variant) => (
    <View style={[styles.content, isCompact && styles.contentCompact]}>
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>{COPY.eyebrow}</Text>
        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            variant === 'wide' && wideFormWidth >= 420 && styles.titleWide,
            isCompact && variant !== 'wide' && styles.titleCompact,
          ]}
        >
          {isLogin ? COPY.loginTitle : COPY.registerTitle}
        </Text>
        <Text style={styles.lede}>
          {isLogin ? COPY.loginLede : COPY.registerLede}
        </Text>
      </View>

      <View
        style={styles.tabs}
        accessibilityRole="tablist"
        accessibilityLabel="Modo de acceso"
      >
        {MODES.map((option) => {
          const active = option.value === mode;

          return (
            <Pressable
              key={option.value}
              onPress={() => handleModeChange(option.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.label}
              style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {option.label}
              </Text>
              <View
                style={[
                  styles.tabUnderline,
                  active && styles.tabUnderlineActive,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {renderForm()}
    </View>
  );

  if (!isWide) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : Platform.OS === 'android'
                ? 'height'
                : undefined
          }
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.stackedContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* Fotografía a sangre que se funde con el lienzo crema */}
            <View style={[styles.hero, { height: heroHeight + insets.top }]}>
              <Image
                source={BOTTLES_SOURCE}
                style={[
                  styles.photoImage,
                  {
                    width: heroPlateSize,
                    height: heroPlateSize,
                    left: 0,
                    top: heroPlateTop,
                  },
                ]}
                resizeMode="contain"
                accessible={false}
              />

              <LinearGradient
                pointerEvents="none"
                colors={[colors.background, colors.photoFadeStart]}
                style={[styles.heroFadeTop, { top: insets.top }]}
              />

              <LinearGradient
                pointerEvents="none"
                colors={[colors.photoFadeStart, colors.background]}
                style={styles.heroFade}
              />

              <View
                pointerEvents="none"
                style={[
                  styles.logoWrap,
                  {
                    top: insets.top + spacing.sm,
                    left: Math.max(insets.left, spacing.xxl),
                  },
                ]}
              >
                <BrandLogo width={logoWidth} decorative />
              </View>
            </View>

            <View
              style={[
                styles.canvas,
                {
                  paddingLeft: Math.max(insets.left, spacing.xxl),
                  paddingRight: Math.max(insets.right, spacing.xxl),
                  paddingBottom: Math.max(insets.bottom, spacing.xxxl),
                },
              ]}
            >
              {renderAuthContent('stacked')}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.wideRoot}>
      <StatusBar style="dark" />

      <View style={[styles.widePhoto, { width: widePhotoWidth }]}>
        <Image
          source={BOTTLES_SOURCE}
          style={[
            styles.photoImage,
            {
              width: widePlateSize,
              height: widePlateSize,
              left: 0,
              top: widePlateTop,
            },
          ]}
          resizeMode="contain"
          accessible={false}
        />

        {/* Bordes superior e inferior fundidos con el lienzo */}
        <LinearGradient
          pointerEvents="none"
          colors={[colors.background, colors.photoFadeStart]}
          style={[styles.wideEdgeFade, { top: wideTopFade, height: EDGE_FADE }]}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[colors.photoFadeStart, colors.background]}
          style={[
            styles.wideEdgeFade,
            { top: wideBottomFade, height: EDGE_FADE },
          ]}
        />

        {/* Degradado derecho: tres paradas, sin cortar las botellas */}
        <LinearGradient
          pointerEvents="none"
          colors={[
            colors.photoFadeStart,
            colors.photoFadeMid,
            colors.background,
          ]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.wideFade, { width: wideFadeWidth }]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.logoWrap,
            {
              top: Math.max(
                insets.top + spacing.lg,
                wideTopFade + spacing.md
              ),
              left: Math.max(insets.left, spacing.xxl),
            },
          ]}
        >
          <BrandLogo width={LOGO_WIDTH} decorative />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.wideScroll,
            {
              paddingLeft: Math.max(insets.left, spacing.huge),
              paddingRight: Math.max(
                insets.right + spacing.huge,
                wideFormWidth * 0.12
              ),
              paddingTop: insets.top + spacing.huge,
              paddingBottom: insets.bottom + spacing.huge,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wideFormColumn}>
            {renderAuthContent('wide')}
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

  // Fotografía a sangre y degradado al lienzo crema
  stackedContent: {
    flexGrow: 1,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  photoImage: {
    position: 'absolute',
  },
  heroFadeTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: EDGE_FADE,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_FADE,
  },
  logoWrap: {
    position: 'absolute',
  },
  canvas: {
    flexGrow: 1,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },

  // Contenido editorial
  content: {
    width: '100%',
    maxWidth: 520,
    gap: spacing.xxl,
  },
  contentCompact: {
    gap: spacing.lg,
  },
  headerBlock: {
    gap: spacing.xs + 2,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  title: {
    ...typography.display,
    fontSize: 30,
    lineHeight: 40,
    color: colors.textPrimary,
  },
  titleWide: {
    fontSize: 34,
    lineHeight: 44,
  },
  titleCompact: {
    fontSize: 26,
    lineHeight: 36,
  },
  lede: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  // Pestañas con subrayado ámbar
  tabs: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tab: {
    flex: 1,
    minHeight: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  tabUnderline: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: -1,
    height: 2,
    backgroundColor: colors.brandAccent,
    opacity: 0,
  },
  tabUnderlineActive: {
    opacity: 1,
  },

  // Formulario: una sola retícula, campos con línea inferior
  form: {
    gap: spacing.lg,
  },
  formCompact: {
    gap: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  fieldCol: {
    flex: 1,
  },
  field: {
    gap: spacing.xs + 2,
  },
  fieldLabel: {
    ...typography.fieldLabel,
    color: colors.textSecondary,
  },
  fieldLabelFocused: {
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    ...typography.body,
    minHeight: sizes.input,
    paddingVertical: spacing.md,
    paddingRight: spacing.giant,
    color: colors.ink,
  },
  inputPlain: {
    paddingRight: 0,
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 2,
    width: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedSoft: {
    opacity: 0.6,
  },
  fieldLineTrack: {
    height: 2,
    justifyContent: 'flex-end',
  },
  fieldLine: {
    height: 1,
    backgroundColor: colors.fieldLine,
  },
  fieldLineFocused: {
    height: 2,
    backgroundColor: colors.brandAccent,
  },
  fieldLineError: {
    height: 2,
    backgroundColor: colors.error,
  },
  fieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.errorSurface,
  },
  fieldErrorText: {
    ...typography.caption,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.error,
  },
  fieldHelper: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },

  // Avisos en línea
  notice: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderLeftWidth: 2,
  },
  noticeError: {
    backgroundColor: colors.errorSurface,
    borderLeftColor: colors.error,
  },
  noticeSuccess: {
    backgroundColor: colors.successSurface,
    borderLeftColor: colors.success,
  },
  noticeInfo: {
    backgroundColor: colors.primaryTint,
    borderLeftColor: colors.primary,
  },
  noticeTitle: {
    ...typography.label,
    fontSize: 13,
    lineHeight: 18,
  },
  noticeMessage: {
    ...typography.caption,
    fontSize: 13,
    lineHeight: 19,
  },
  noticeTextError: {
    color: colors.error,
  },
  noticeTextSuccess: {
    color: colors.success,
  },
  noticeTextInfo: {
    color: colors.primary,
  },

  // Acción principal: rectangular, verde azulado, plana
  submit: {
    minHeight: sizes.control,
    borderRadius: radii.hairline,
    backgroundColor: colors.action,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitPressed: {
    backgroundColor: colors.actionPressed,
  },
  submitLabel: {
    ...typography.button,
    color: colors.textOnAction,
    textAlign: 'center',
  },
  fineprint: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Escritorio: foto a sangre a la izquierda, formulario sobre crema
  wideRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  widePhoto: {
    height: '100%',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  wideEdgeFade: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  wideFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
  },
  wideScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  wideFormColumn: {
    width: '100%',
    maxWidth: FORM_MAX_WIDTH,
    alignSelf: 'center',
  },
});







