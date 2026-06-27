import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppButton } from './AppButton';
import { AppError } from '../types/apiError';

interface Props { error: AppError; onRetry?: () => void; }

export const ErrorMessage: React.FC<Props> = ({ error, onRetry }) => (
  <View style={styles.wrap}>
    <Text style={styles.icon}>{error.isNetworkError ? '📡' : '⚠️'}</Text>
    <Text style={styles.msg}>{error.message}</Text>
    {error.errors && Object.entries(error.errors).map(([field, msg]) => (
      <Text key={field} style={styles.field}>• {field}: {msg}</Text>
    ))}
    {onRetry && <AppButton title="Reintentar" onPress={onRetry} variant="outline" style={styles.btn} />}
  </View>
);

const styles = StyleSheet.create({
  wrap: { padding: 20, alignItems: 'center' },
  icon: { fontSize: 32, marginBottom: 8 },
  msg: { color: '#C53030', fontSize: 15, textAlign: 'center', fontWeight: '600', marginBottom: 8 },
  field: { color: '#E53E3E', fontSize: 13, marginBottom: 2 },
  btn: { marginTop: 16 },
});