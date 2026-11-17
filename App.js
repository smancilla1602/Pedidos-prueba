import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AnimatedSplash from './components/AnimatedSplash';
import BrandLogo from './components/BrandLogo';
import AuthScreen from './screens/AuthScreen';
import SessionScreen from './screens/SessionScreen';
import { useAuth } from './hooks/useAuth';
import { colors, spacing, typography } from './theme';

function BootScreen() {
  return (
    <SafeAreaView style={styles.boot} edges={['top', 'bottom', 'left', 'right']}>
      <BrandLogo width={140} />
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.bootSpinner}
      />
      <Text style={styles.bootText} accessibilityLiveRegion="polite">
        Preparando tu cuenta…
      </Text>
    </SafeAreaView>
  );
}

export default function App() {
  const {
    session,
    initializing,
    submitting,
    feedback,
    signIn,
    signUp,
    signOut,
    clearFeedback,
  } = useAuth();
  const [splashVisible, setSplashVisible] = useState(true);

  let content;
  if (initializing) {
    content = <BootScreen />;
  } else if (session?.user) {
    content = (
      <SessionScreen
        session={session}
        onSignOut={signOut}
        signingOut={submitting}
        feedback={feedback}
      />
    );
  } else {
    content = (
      <AuthScreen
        onSignIn={signIn}
        onSignUp={signUp}
        submitting={submitting}
        feedback={feedback}
        onClearFeedback={clearFeedback}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={splashVisible ? 'light' : 'dark'} />
      <View style={styles.root}>
        <View
          style={styles.root}
          accessibilityElementsHidden={splashVisible}
          importantForAccessibility={
            splashVisible ? 'no-hide-descendants' : 'auto'
          }
        >
          {content}
        </View>

        {/* El splash se monta encima; al desvanecerse revela la pantalla real. */}
        {splashVisible ? (
          <AnimatedSplash onFinish={() => setSplashVisible(false)} />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  boot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  bootSpinner: {
    marginTop: spacing.lg,
  },
  bootText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
