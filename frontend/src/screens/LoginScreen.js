import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { theme } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';

const DEMO_USERS = [
  { label: 'Client (Sarah)', email: 'client.sarah@uniwork.local', pass: 'Password123!' },
  { label: 'Client (David)', email: 'client.david@uniwork.local', pass: 'Password123!' },
  { label: 'Freelancer (Alex)', email: 'freelancer.alex@uniwork.local', pass: 'Password123!' },
  { label: 'Freelancer (Priya)', email: 'freelancer.priya@uniwork.local', pass: 'Password123!' },
  { label: 'Admin', email: 'admin@uniwork.local', pass: 'AdminPass123!' },
];

export default function LoginScreen({ onNavigate }) {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        onNavigate('Dashboard');
      } else {
        alert(res.message || 'Login failed');
      }
    } catch (err) {
      alert('Login error. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (user) => {
    setEmail(user.email);
    setPassword(user.pass);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.card, theme.shadows.md]}>
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 24 }}>🎓</Text>
        </View>

        <Text style={styles.title}>Sign in to UniWork</Text>
        <Text style={styles.subtitle}>Enter your university or project credentials</Text>

        {/* Email */}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="name@university.edu"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
        />

        <Button
          title="Sign In →"
          size="lg"
          variant="primary"
          loading={loading}
          onPress={handleLogin}
          style={{ marginTop: 10 }}
        />

        {/* Examiner Demo Autofill */}
        <View style={styles.autofillBox}>
          <Text style={styles.autofillTitle}>✨ Examiner Demo Autofill</Text>
          <Text style={styles.autofillDesc}>Click any pre-seeded persona to populate credentials immediately:</Text>
          <View style={styles.demoButtonsRow}>
            {DEMO_USERS.map((u) => (
              <TouchableOpacity
                key={u.email}
                style={styles.demoBtn}
                onPress={() => autofill(u)}
              >
                <Text style={styles.demoBtnText}>{u.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => onNavigate('Register')}>
            <Text style={styles.footerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgSubtle,
  },
  content: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: 34,
    maxWidth: 440,
    width: '100%',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 14,
    outlineStyle: 'none',
  },
  autofillBox: {
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 14,
    marginTop: 24,
  },
  autofillTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  autofillDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  demoBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  demoBtnText: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
