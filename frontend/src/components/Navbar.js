import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme/colors';
import Button from './Button';

export default function Navbar({ currentScreen, onNavigate }) {
  const { user, walletBalance, logout } = useContext(AuthContext);

  return (
    <View style={styles.navbar}>
      <View style={styles.inner}>
        {/* Brand */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigate('Home')}
          style={styles.brandWrap}
        >
          <Text style={styles.brandText}>UniWork</Text>
          <View style={styles.brandDot} />
        </TouchableOpacity>

        {/* Nav Links (Desktop / Web) */}
        <View style={styles.links}>
          <TouchableOpacity
            style={[styles.navLink, currentScreen === 'Home' && styles.navLinkActive]}
            onPress={() => onNavigate('Home')}
          >
            <Text style={[styles.navLinkText, currentScreen === 'Home' && styles.navLinkTextActive]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navLink, currentScreen === 'Jobs' && styles.navLinkActive]}
            onPress={() => onNavigate('Jobs')}
          >
            <Text style={[styles.navLinkText, currentScreen === 'Jobs' && styles.navLinkTextActive]}>
              Browse Jobs
            </Text>
          </TouchableOpacity>

          {user && user.isClient && (
            <TouchableOpacity
              style={[styles.navLink, currentScreen === 'PostJob' && styles.navLinkActive]}
              onPress={() => onNavigate('PostJob')}
            >
              <Text style={[styles.navLinkText, currentScreen === 'PostJob' && styles.navLinkTextActive]}>
                Post a Job
              </Text>
            </TouchableOpacity>
          )}

          {user && (
            <>
              <TouchableOpacity
                style={[styles.navLink, currentScreen === 'Contracts' && styles.navLinkActive]}
                onPress={() => onNavigate('Contracts')}
              >
                <Text style={[styles.navLinkText, currentScreen === 'Contracts' && styles.navLinkTextActive]}>
                  Contracts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navLink, currentScreen === 'Dashboard' && styles.navLinkActive]}
                onPress={() => onNavigate('Dashboard')}
              >
                <Text style={[styles.navLinkText, currentScreen === 'Dashboard' && styles.navLinkTextActive]}>
                  Dashboard
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.navLink, currentScreen === 'HowItWorks' && styles.navLinkActive]}
            onPress={() => onNavigate('HowItWorks')}
          >
            <Text style={[styles.navLinkText, currentScreen === 'HowItWorks' && styles.navLinkTextActive]}>
              How It Works
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right side actions */}
        <View style={styles.actions}>
          {user ? (
            <View style={styles.userSection}>
              {/* Wallet Pill */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onNavigate('Wallet')}
                style={styles.walletPill}
              >
                <Text style={styles.walletText}>
                  Wallet: <Text style={styles.walletBold}>${walletBalance.toFixed(2)}</Text>
                </Text>
              </TouchableOpacity>

              {/* User badge */}
              <View style={styles.userBadge}>
                <Text style={styles.userName}>{user.firstName}</Text>
                <Text style={styles.userRole}>({user.roleLabel})</Text>
              </View>

              {/* Logout Button */}
              <Button
                title="Log Out"
                variant="outline"
                size="sm"
                onPress={logout}
                style={styles.logoutBtn}
              />
            </View>
          ) : (
            <View style={styles.authButtons}>
              <Button
                title="Log In"
                variant="outline"
                size="sm"
                onPress={() => onNavigate('Login')}
                style={{ marginRight: 8 }}
              />
              <Button
                title="Sign Up"
                variant="primary"
                size="sm"
                onPress={() => onNavigate('Register')}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    height: 64,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 3,
    marginTop: 6,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  navLink: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radii.sm,
    marginRight: 4,
  },
  navLinkActive: {
    backgroundColor: theme.colors.bgSubtle,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  navLinkTextActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletPill: {
    backgroundColor: theme.colors.successSubtle,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: theme.radii.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  walletText: {
    fontSize: 13,
    color: theme.colors.successText,
    fontWeight: '500',
  },
  walletBold: {
    fontWeight: '700',
  },
  userBadge: {
    marginRight: 10,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  userRole: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
