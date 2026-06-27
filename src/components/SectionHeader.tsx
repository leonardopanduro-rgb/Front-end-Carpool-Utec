import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props { title: string; action?: string; onAction?: () => void; }

export const SectionHeader: React.FC<Props> = ({ title, action, onAction }) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    {action && onAction ? <TouchableOpacity onPress={onAction}><Text style={styles.action}>{action}</Text></TouchableOpacity> : null}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#0B1F3A' },
  action: { fontSize: 13, color: '#18A8E0', fontWeight: '600' },
});