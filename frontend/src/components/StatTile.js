import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

export default function StatTile({ label, value, icon, iconBg, valueColor, style }) {
  return (
    <View style={[styles.tile, theme.shadows.sm, style]}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
        </View>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: iconBg || theme.colors.primarySubtle }]}>
            {icon}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 18,
    flex: 1,
    minWidth: 160,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
