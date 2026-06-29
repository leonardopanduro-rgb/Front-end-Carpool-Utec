import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RequestPublication } from '../types/requestPublication';
import { StatusBadge } from './StatusBadge';
import { AppButton } from './AppButton';

interface Props {
  req: RequestPublication;
  onAccept?: () => void;
  onReject?: () => void;
  accepting?: boolean;
  rejecting?: boolean;
}

export const DriverRequestCard: React.FC<Props> = ({ req, onAccept, onReject, accepting, rejecting }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Text style={styles.id} numberOfLines={1}>{req.requesterName?.trim() || `Solicitante #${req.requesterId}`}</Text>
      <StatusBadge status={req.status} />
    </View>
    {(req.requesterCareer || req.requesterRating != null) ? (
      <Text style={styles.meta}>
        {[req.requesterCareer ? req.requesterCareer.replace(/_/g, ' ') : null,
          req.requesterRating != null ? `⭐ ${req.requesterRating.toFixed(1)}` : null]
          .filter(Boolean).join('  ·  ')}
      </Text>
    ) : null}
    <Text style={styles.info}>{req.requesterIsDriver ? '🚗 Viene como conductor' : '🙋 Viene como pasajero'}</Text>
    <Text style={styles.info}>💺 Asientos: {req.seats}</Text>
    <Text style={styles.info}>📍 {req.pickupPointOrDestine}</Text>
    {req.message ? <Text style={styles.msg}>"{req.message}"</Text> : null}
    {req.status === 'PENDING' && (
      <View style={styles.actions}>
        <AppButton title="Aceptar" onPress={onAccept!} loading={accepting} style={styles.btnAccept} />
        <AppButton title="Rechazar" onPress={onReject!} variant="danger" loading={rejecting} style={styles.btnReject} />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#0B1F3A', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  id: { fontSize: 15, fontWeight: '800', color: '#0B1F3A', flex: 1, marginRight: 8 },
  meta: { fontSize: 12, color: '#8A9BB0', fontWeight: '600', marginBottom: 6 },
  info: { fontSize: 13, color: '#4A5568', marginBottom: 4 },
  msg: { fontSize: 13, color: '#8A9BB0', fontStyle: 'italic', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnAccept: { flex: 1 },
  btnReject: { flex: 1 },
});