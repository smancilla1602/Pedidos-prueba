import React from 'react';
import {
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
import {
  colors,
  layout,
  radii,
  shadows,
  sizes,
  spacing,
  typography,
} from '../theme';

function pickString(...candidates) {
  const value = candidates.find(
    (candidate) => typeof candidate === 'string' && candidate.trim().length > 0
  );
  return value ? value.trim() : '';
}

/**
 * Normaliza el perfil guardado en user_metadata durante el registro.
 * Es tolerante con cuentas antiguas que no tienen esos datos.
 */
function readProfile(user) {
  const metadata = user?.user_metadata ?? {};
  return {
    email: pickString(user?.email),
    nombre: pickString(metadata.nombre),
    apellido: pickString(metadata.apellido),
    celular: pickString(metadata.celular),
    empresaSucursal: pickString(
      metadata.empresa_sucursal,
      metadata.empresaSucursal
    ),
  };
}

function buildInitials({ nombre, apellido, email }) {
  const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.trim();
  if (initials) return initials.toUpperCase();
  return (email.charAt(0) || 'C').toUpperCase();
}

function InfoRow({ icon, label, value, last = false, mono = false }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, mono && styles.rowValueMono]} selectable>
          {value || 'No registrado'}
        </Text>
      </View>
    </View>
  );
}

export default function SessionScreen({
  session,
  onSignOut,
  signingOut = false,
  feedback,
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const user = session?.user ?? null;
  const profile = readProfile(user);
  const fullName = `${profile.nombre} ${profile.apellido}`.trim();
  const displayName = fullName || profile.email.split('@')[0] || 'cervecero';
  const initials = buildInitials(profile);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWide && styles.scrollContentWide,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoChip}>
              <BrandLogo width={36} decorative />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.headerOverline}>CERVECERÍA DE COLIMA</Text>
              <Text style={styles.headerTitle}>Mi cuenta</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.statusChip}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.statusText}>Sesión activa</Text>
            </View>
            <Text accessibilityRole="header" style={styles.greeting}>
              Hola, {displayName}
            </Text>
            <Text style={styles.greetingSubtitle}>
              Estos son los datos registrados en tu cuenta de Cervecería de Colima.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.avatarRow}>
              <View
                style={styles.avatar}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.avatarCopy}>
                <Text style={styles.name}>
                  {fullName || 'Cuenta de Cervecería de Colima'}
                </Text>
                <Text style={styles.email}>
                  {profile.email || 'Sin correo registrado'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <InfoRow
              icon="id-card-outline"
              label="ID de usuario"
              value={user?.id}
              mono
            />
            <InfoRow
              icon="mail-outline"
              label="Correo electrónico"
              value={profile.email}
            />
            <InfoRow icon="person-outline" label="Nombre" value={profile.nombre} />
            <InfoRow
              icon="person-outline"
              label="Apellido"
              value={profile.apellido}
            />
            <InfoRow
              icon="call-outline"
              label="Número de celular"
              value={profile.celular}
            />
            <InfoRow
              icon="storefront-outline"
              label="Empresa / Sucursal"
              value={profile.empresaSucursal}
              last
            />
          </View>

          {feedback ? (
            <InlineNotice
              type={feedback.type}
              title={feedback.title}
              message={feedback.message}
              style={styles.notice}
            />
          ) : null}

          <PrimaryButton
            variant="danger"
            icon="log-out-outline"
            label="Cerrar sesión"
            onPress={onSignOut}
            loading={signingOut}
            accessibilityHint="Cierra la sesión de Supabase en este dispositivo"
            style={styles.signOut}
          />

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={sizes.iconSm}
              color={colors.textMuted}
            />
            <Text style={styles.footerText}>Conexión segura con Supabase</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoChip: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerOverline: {
    ...typography.overline,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  hero: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  statusChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  greeting: {
    ...typography.display,
    color: colors.textPrimary,
  },
  greetingSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    ...shadows.card,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.subtitle,
    color: colors.textOnPrimary,
    letterSpacing: 0.5,
  },
  avatarCopy: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  email: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  rowValueMono: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  notice: {
    marginTop: spacing.lg,
  },
  signOut: {
    marginTop: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

