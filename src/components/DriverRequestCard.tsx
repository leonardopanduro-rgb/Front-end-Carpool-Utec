import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RequestPublication } from '../types/requestPublication';
import { StatusBadge } from './StatusBadge';
import { AppButton } from './AppButton';
import { formatPricePerSeat, formatSeatsTotal } from '../utils/formatters';

interface Props {
  req: RequestPublication;
  pricePerSeat: number;
  onAccept?: () => void;
  onReject?: () => void;
  accepting?: boolean;
  rejecting?: boolean;
}

export const DriverRequestCard: React.FC<Props> = ({ req, pricePerSeat, onAccept, onReject, accepting, rejecting }) => {
  const photoUrl = req.requesterPhotoUrl ?? null;
  const requesterName = req.requesterName?.trim() || `Solicitante #${req.requesterId}`;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.identity}>
          {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.avatar} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.id} numberOfLines={1}>{requesterName}</Text>
            {req.requesterCareer ? <Text style={styles.meta}>{req.requesterCareer.replace(/_/g, ' ')}</Text> : null}
          </View>
        </View>
        <StatusBadge status={req.status} />
      </View>

      <Text style={styles.info}>Asientos solicitados: {req.requestedSeats}</Text>
      <Text style={styles.info}>Precio por asiento: {formatPricePerSeat(pricePerSeat)}</Text>
      <Text style={styles.total}>{formatSeatsTotal(pricePerSeat, req.requestedSeats)}</Text>
      {req.message ? <Text style={styles.msg}>"{req.message}"</Text> : null}

      {req.status === 'PENDING' && (
        <View style={styles.actions}>
          <AppButton title="Aceptar" onPress={onAccept!} loading={accepting} style={styles.flexBtn} />
          <AppButton title="Rechazar" onPress={onReject!} variant="danger" loading={rejecting} style={styles.flexBtn} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#0B1F3A', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#D0D9E8' },
  id: { fontSize: 15, fontWeight: '800', color: '#0B1F3A' },
  meta: { fontSize: 12, color: '#8A9BB0', fontWeight: '600', marginTop: 2 },
  info: { fontSize: 13, color: '#4A5568', marginBottom: 4 },
  total: { fontSize: 14, color: '#0B1F3A', fontWeight: '800', marginTop: 4, marginBottom: 4 },
  msg: { fontSize: 13, color: '#8A9BB0', fontStyle: 'italic', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  flexBtn: { flex: 1 },
});
