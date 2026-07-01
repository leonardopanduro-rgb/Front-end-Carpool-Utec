import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Publication } from '../types/publication';
import { formatDateTime, formatDistance, formatPricePerSeat } from '../utils/formatters';

interface Props {
  pub: Publication;
  onPress: () => void;
  isOwn?: boolean;
}

export const TripCard: React.FC<Props> = ({ pub, onPress, isOwn }) => {
  const direction = pub.fromUTEC ? 'Saliendo de UTEC' : 'Hacia campus';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.dirBadge}><Text style={styles.dirTxt}>{direction}</Text></View>
        <Text style={styles.type}>Viaje publicado</Text>
      </View>
      <Text style={styles.titulo} numberOfLines={1}>{pub.titulo}</Text>
      <Text style={styles.dest} numberOfLines={1}>{pub.destinationOrOrigin}</Text>
      <View style={styles.footer}>
        <Text style={styles.time}>{formatDateTime(pub.departureTime)}</Text>
        <Text style={styles.seats}>{pub.seats} asiento(s)</Text>
        {pub.distanceToUtecKm != null && <Text style={styles.dist}>{formatDistance(pub.distanceToUtecKm)}</Text>}
      </View>
      <View style={styles.bottom}>
        <Text style={styles.aporte}>Precio por asiento: {formatPricePerSeat(pub.pricePerSeat)}</Text>
        <Text style={styles.detail}>Ver detalle</Text>
      </View>
      {isOwn && <View style={styles.ownBadge}><Text style={styles.ownTxt}>Tu publicacion</Text></View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#0B1F3A', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dirBadge: { backgroundColor: '#E8F7FD', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  dirTxt: { color: '#18A8E0', fontSize: 12, fontWeight: '700' },
  type: { color: '#8A9BB0', fontSize: 12 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#0B1F3A', marginBottom: 4 },
  dest: { fontSize: 14, color: '#4A5568', marginBottom: 10 },
  footer: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  time: { color: '#8A9BB0', fontSize: 12 },
  seats: { color: '#8A9BB0', fontSize: 12 },
  dist: { color: '#18A8E0', fontSize: 12 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F2F4F7', gap: 8 },
  aporte: { color: '#4A5568', fontSize: 12, fontWeight: '600', flex: 1 },
  detail: { color: '#18A8E0', fontSize: 13, fontWeight: '700' },
  ownBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#0B1F3A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  ownTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
