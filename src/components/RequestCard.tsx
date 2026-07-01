import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RequestPublication } from '../types/requestPublication';
import { StatusBadge } from './StatusBadge';
import { AppButton } from './AppButton';
import { formatPricePerSeat, formatSeatsTotal } from '../utils/formatters';

interface Props {
  req: RequestPublication;
  onCancel?: () => void;
  cancelling?: boolean;
  onViewPublication?: () => void;
}

export const RequestCard: React.FC<Props> = ({ req, onCancel, cancelling, onViewPublication }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Text style={styles.pub}>Solicitud de viaje</Text>
      <StatusBadge status={req.status} />
    </View>
    <Text style={styles.seats}>Asientos solicitados: {req.requestedSeats}</Text>
    <Text style={styles.price}>Precio por asiento: {formatPricePerSeat(req.pricePerSeat)}</Text>
    <Text style={styles.total}>{formatSeatsTotal(req.pricePerSeat, req.requestedSeats)}</Text>
    {req.message ? <Text style={styles.msg}>"{req.message}"</Text> : null}
    <View style={styles.actions}>
      {onViewPublication && (
        <AppButton title="Ver publicacion" onPress={onViewPublication} variant="outline" style={styles.flexBtn} />
      )}
      {req.status === 'PENDING' && onCancel && (
        <AppButton title="Cancelar" onPress={onCancel} variant="danger" loading={cancelling} style={styles.flexBtn} />
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#0B1F3A', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pub: { fontSize: 14, fontWeight: '700', color: '#0B1F3A' },
  seats: { fontSize: 13, color: '#4A5568', marginBottom: 4 },
  price: { fontSize: 13, color: '#4A5568', marginBottom: 4 },
  total: { fontSize: 14, color: '#0B1F3A', fontWeight: '800', marginBottom: 4 },
  msg: { fontSize: 13, color: '#8A9BB0', fontStyle: 'italic', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  flexBtn: { flex: 1, minWidth: 120 },
});
