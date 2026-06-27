import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => (
  <View style={styles.wrap}>
    <ActivityIndicator size="large" color="#18A8E0" />
    <Text style={styles.txt}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  txt: { color: '#8A9BB0', fontSize: 14 },
});