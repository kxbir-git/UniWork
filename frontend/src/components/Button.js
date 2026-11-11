import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../theme/colors';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  pill = true,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.bgMuted;
    if (variant === 'primary') return theme.colors.primary;
    if (variant === 'success') return theme.colors.success;
    if (variant === 'danger') return theme.colors.danger;
    if (variant === 'outline' || variant === 'ghost') return 'transparent';
    if (variant === 'secondary') return theme.colors.bgSubtle;
    return theme.colors.primary;
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.border;
    if (variant === 'outline') return theme.colors.borderStrong;
    if (variant === 'outline-primary') return theme.colors.primary;
    if (variant === 'secondary') return theme.colors.border;
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textLight;
    if (variant === 'primary' || variant === 'success' || variant === 'danger') return '#ffffff';
    if (variant === 'outline-primary') return theme.colors.primary;
    if (variant === 'outline') return theme.colors.text;
    if (variant === 'secondary') return theme.colors.text;
    return theme.colors.text;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: (variant === 'outline' || variant === 'outline-primary' || variant === 'secondary') ? 1 : 0,
          borderRadius: pill ? theme.radii.pill : theme.radii.md,
          paddingVertical: size === 'sm' ? 6 : size === 'lg' ? 14 : 10,
          paddingHorizontal: size === 'sm' ? 14 : size === 'lg' ? 24 : 18,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14,
                marginLeft: icon ? 6 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  text: {
    fontWeight: '600',
  },
});
