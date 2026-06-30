import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RequestStatus } from '../types/requestPublication';

const CONFIG: Record<RequestStatus, { label: string; bg: string; color: string }> = {
  PENDING:   { label: 'Pendiente',   bg: '#FFF8DC', color: '#B7791F' },
  COUNTERED: { label: 'Contraoferta', bg: '#FFF4E5', color: '#C05621' },
  ACCEPTED:  { label: 'Aceptado',    bg: '#F0FFF4', color: '#276749' },
  REJECTED:  { label: 'Rechazado',   bg: '#FFF5F5', color: '#C53030' },
  CANCELLED: { label: 'Cancelado',   bg: '#F7FAFC', color: '#718096' },
};

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const { label, bg, color } = CONFIG[status] ?? CONFIG.PENDING;
  return <View style={[styles.badge, { backgroundColor: bg }]}><Text style={[styles.txt, { color }]}>{label}</Text></View>;
};

const styles = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  txt: { fontSize: 12, fontWeight: '700' },
});