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

export default function RegisterScreen({ onNavigate }) {
  const { register } = useContext(AuthContext);

  const [role, setRole] = useState('freelancer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        firstName,
        lastName,
        email,
        location: location || 'Campus / Remote',
        role,
        password,
      });

      if (res.success) {
        onNavigate('Dashboard');
      } else {
        alert(res.message || 'Registration failed');
      }
    } catch (err) {
      alert('Registration error. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.card, theme.shadows.md]}>
        <Text style={styles.title}>Create Your UniWork Account</Text>
        <Text style={styles.subtitle}>Join the premier university freelance ecosystem</Text>

        {/* Role Choice */}
        <Text style={styles.label}>I want to:</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleCard, role === 'freelancer' && styles.roleCardActive]}
            onPress={() => setRole('freelancer')}
          >
            <Text style={[styles.roleTitle, role === 'freelancer' && styles.roleTitleActive]}>
              🎓 Work as a Student
            </Text>
            <Text style={styles.roleSub}>Find real projects & earn escrow-backed funds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, role === 'client' && styles.roleCardActive]}
            onPress={() => setRole('client')}
          >
            <Text style={[styles.roleTitle, role === 'client' && styles.roleTitleActive]}>
              🏢 Hire University Talent
            </Text>
            <Text style={styles.roleSub}>Post projects & collaborate safely</Text>
          </TouchableOpacity>
        </View>

        {/* Name inputs */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rivera"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        {/* Email */}
        <Text style={styles.label}>Email Address (Academic or Personal)</Text>
        <TextInput
          style={styles.input}
          placeholder="name@university.edu"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Campus Location */}
        <Text style={styles.label}>Campus or City Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. UC Berkeley Campus"
          value={location}
          onChangeText={setLocation}
        />

        {/* Password */}
        <Text style={styles.label}>Password (minimum 6 characters)</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleRegister}
        />

        <Button
          title="Create UniWork Account →"
          size="lg"
          variant="primary"
          loading={loading}
          onPress={handleRegister}
          style={{ marginTop: 14 }}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already registered? </Text>
          <TouchableOpacity onPress={() => onNavigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
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
    maxWidth: 520,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
    marginTop: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  roleCard: {
    flex: 1,
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 12,
  },
  roleCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySubtle,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  roleTitleActive: {
    color: theme.colors.primary,
  },
  roleSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 14,
  },
  row: {
    flexDirection: 'row',
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
    marginBottom: 8,
    outlineStyle: 'none',
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
