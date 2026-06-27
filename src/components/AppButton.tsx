import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  style?: ViewStyle;
}

export const AppButton: React.FC<Props> = ({
  title, onPress, loading = false, disabled = false, variant = 'primary', style,
}) => {
  const bg = variant === 'primary' ? '#18A8E0'
    : variant === 'secondary' ? '#0B1F3A'
    : variant === 'danger' ? '#E53E3E'
    : 'transparent';
  const border = variant === 'outline' ? '#18A8E0' : bg;
  const textColor = variant === 'outline' ? '#18A8E0' : '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.btn, { backgroundColor: bg, borderColor: border, opacity: (disabled || loading) ? 0.6 : 1 }, style]}
    >
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <Text style={[styles.text, { color: textColor }]}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { height: 52, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  text: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});