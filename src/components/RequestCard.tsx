import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RequestPublication } from '../types/requestPublication';
import { StatusBadge } from './StatusBadge';
import { AppButton } from './AppButton';
import { formatDateTime } from '../utils/formatters';

interface Props { req: RequestPublication; onCancel?: () => void; cancelling?: boolean; }

export const RequestCard: React.FC<Props> = ({ req, onCancel, cancelling }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Text style={styles.pub}>Publicación #{req.publicationId}</Text>
      <StatusBadge status={req.status} />
    </View>
    <Text style={styles.pickup}>📍 Punto: {req.pickupPointOrDestine}</Text>
    <Text style={styles.seats}>💺 Asientos: {req.seats}</Text>
    {req.message ? <Text style={styles.msg}>"{req.message}"</Text> : null}
    {req.status === 'PENDING' && onCancel && (
      <AppButton title="Cancelar solicitud" onPress={onCancel} variant="danger" loading={cancelling} style={styles.btn} />
    )}
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#0B1F3A', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pub: { fontSize: 14, fontWeight: '700', color: '#0B1F3A' },
  pickup: { fontSize: 13, color: '#4A5568', marginBottom: 4 },
  seats: { fontSize: 13, color: '#4A5568', marginBottom: 4 },
  msg: { fontSize: 13, color: '#8A9BB0', fontStyle: 'italic', marginBottom: 8 },
  btn: { marginTop: 8 },
});