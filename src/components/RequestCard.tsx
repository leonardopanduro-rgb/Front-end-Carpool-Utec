import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RequestPublication } from '../types/requestPublication';
import { StatusBadge } from './StatusBadge';
import { AppButton } from './AppButton';

interface Props {
  req: RequestPublication;
  onCancel?: () => void;
  cancelling?: boolean;
  onViewPublication?: () => void;
  onAcceptCounter?: () => void;
  accepting?: boolean;
}

const fareLine = (req: RequestPublication): string => {
  if (req.status === 'ACCEPTED' && req.agreedFare != null) return `💵 Aporte acordado: S/ ${req.agreedFare}`;
  if (req.status === 'COUNTERED' && req.counterFare != null) return `💵 Contraoferta del conductor: S/ ${req.counterFare}`;
  if (req.proposedFare != null) return `💵 Ofreciste: S/ ${req.proposedFare}`;
  return '💵 Aporte a coordinar';
};

export const RequestCard: React.FC<Props> = ({ req, onCancel, cancelling, onViewPublication, onAcceptCounter, accepting }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Text style={styles.pub}>{req.requesterIsDriver ? '🚗 Ofreciste llevar' : '🙋 Pediste asiento'}</Text>
      <StatusBadge status={req.status} />
    </View>
    <Text style={styles.pickup}>📍 Punto: {req.pickupPointOrDestine}</Text>
    <Text style={styles.seats}>💺 Asientos: {req.seats}</Text>
    <Text style={styles.fare}>{fareLine(req)}</Text>
    {req.message ? <Text style={styles.msg}>"{req.message}"</Text> : null}
    <View style={styles.actions}>
      {onViewPublication && (
        <AppButton title="Ver publicación" onPress={onViewPublication} variant="outline" style={styles.flexBtn} />
      )}
      {req.status === 'COUNTERED' && onAcceptCounter && (
        <AppButton title={req.counterFare != null ? `Aceptar S/ ${req.counterFare}` : 'Aceptar'} onPress={onAcceptCounter} loading={accepting} style={styles.flexBtn} />
      )}
      {(req.status === 'PENDING' || req.status === 'COUNTERED') && onCancel && (
        <AppButton title={req.status === 'COUNTERED' ? 'Rechazar' : 'Cancelar'} onPress={onCancel} variant="danger" loading={cancelling} style={styles.flexBtn} />
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#0B1F3A', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pub: { fontSize: 14, fontWeight: '700', color: '#0B1F3A' },
  pickup: { fontSize: 13, color: '#4A5568', marginBottom: 4 },
  seats: { fontSize: 13, color: '#4A5568', marginBottom: 4 },
  fare: { fontSize: 14, color: '#0B1F3A', fontWeight: '700', marginBottom: 4 },
  msg: { fontSize: 13, color: '#8A9BB0', fontStyle: 'italic', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  flexBtn: { flex: 1, minWidth: 120 },
});
