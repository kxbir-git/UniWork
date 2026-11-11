import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

export default function Badge({ label, variant = 'primary', style, textStyle }) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: theme.colors.successSubtle, text: theme.colors.successText, border: '#bbf7d0' };
      case 'warning':
        return { bg: theme.colors.warningSubtle, text: theme.colors.warningText, border: '#fde68a' };
      case 'danger':
        return { bg: theme.colors.dangerSubtle, text: theme.colors.dangerText, border: '#fca5a5' };
      case 'sky':
        return { bg: theme.colors.skySubtle, text: theme.colors.skyText, border: '#bae6fd' };
      case 'neutral':
        return { bg: theme.colors.bgMuted, text: theme.colors.textMuted, border: theme.colors.border };
      case 'primary':
      default:
        return { bg: theme.colors.primarySubtle, text: theme.colors.primaryText, border: '#c0cffe' };
    }
  };

  const { bg, text, border } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.text, { color: text }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
