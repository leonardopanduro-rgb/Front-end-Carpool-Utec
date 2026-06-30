import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RequestPublication } from '../types/requestPublication';
import { StatusBadge } from './StatusBadge';
import { AppButton } from './AppButton';

interface Props {
  req: RequestPublication;
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: () => void;
  accepting?: boolean;
  rejecting?: boolean;
  countering?: boolean;
}

export const DriverRequestCard: React.FC<Props> = ({ req, onAccept, onReject, onCounter, accepting, rejecting, countering }) => (
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
    <Text style={styles.fare}>
      {req.proposedFare != null ? `💵 Ofrece S/ ${req.proposedFare}` : '💵 Aporte a coordinar'}
      {req.status === 'COUNTERED' && req.counterFare != null ? `  →  Tu contraoferta: S/ ${req.counterFare}` : ''}
    </Text>
    {req.message ? <Text style={styles.msg}>"{req.message}"</Text> : null}

    {req.status === 'PENDING' && (
      <>
        <AppButton
          title={req.proposedFare != null ? `Aceptar S/ ${req.proposedFare}` : 'Aceptar'}
          onPress={onAccept!} loading={accepting} style={styles.acceptBtn} />
        <View style={styles.actions}>
          {onCounter && <AppButton title="Contraofertar" onPress={onCounter} loading={countering} variant="outline" style={styles.flexBtn} />}
          <AppButton title="Rechazar" onPress={onReject!} variant="danger" loading={rejecting} style={styles.flexBtn} />
        </View>
      </>
    )}
    {req.status === 'COUNTERED' && (
      <Text style={styles.waiting}>⏳ Contraoferta enviada. Esperando que el solicitante acepte o rechace.</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#0B1F3A', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  id: { fontSize: 15, fontWeight: '800', color: '#0B1F3A', flex: 1, marginRight: 8 },
  meta: { fontSize: 12, color: '#8A9BB0', fontWeight: '600', marginBottom: 6 },
  info: { fontSize: 13, color: '#4A5568', marginBottom: 4 },
  fare: { fontSize: 14, color: '#0B1F3A', fontWeight: '700', marginTop: 4, marginBottom: 4 },
  msg: { fontSize: 13, color: '#8A9BB0', fontStyle: 'italic', marginBottom: 8 },
  acceptBtn: { marginTop: 10 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  flexBtn: { flex: 1 },
  waiting: { fontSize: 13, color: '#C05621', fontWeight: '600', marginTop: 10 },
});
