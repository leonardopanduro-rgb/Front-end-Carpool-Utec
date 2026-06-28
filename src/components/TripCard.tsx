import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Publication } from '../types/publication';
import { formatDateTime, formatDistance } from '../utils/formatters';

interface Props { pub: Publication; onPress: () => void; isOwn?: boolean; statusBadge?: string; }

export const TripCard: React.FC<Props> = ({ pub, onPress, isOwn, statusBadge }) => {
  const direction = pub.fromUTEC ? 'Saliendo de UTEC' : 'Hacia campus';
  const type = pub.driverToPassenger ? '🚗 Ofrece asiento' : '🙋 Busca conductor';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.dirBadge}><Text style={styles.dirTxt}>{direction}</Text></View>
        <Text style={styles.type}>{type}</Text>
      </View>
      <Text style={styles.titulo} numberOfLines={1}>{pub.titulo}</Text>
      <Text style={styles.dest} numberOfLines={1}>📍 {pub.destinationOrOrigin}</Text>
      <View style={styles.footer}>
        <Text style={styles.time}>🕐 {formatDateTime(pub.departureTime)}</Text>
        <Text style={styles.seats}>💺 {pub.seats}</Text>
        {pub.distanceToUtecKm != null && <Text style={styles.dist}>{formatDistance(pub.distanceToUtecKm)}</Text>}
      </View>
      {isOwn && <View style={styles.ownBadge}><Text style={styles.ownTxt}>Tu publicación</Text></View>}
      {!isOwn && statusBadge && <View style={styles.statusBadge}><Text style={styles.statusTxt}>{statusBadge}</Text></View>}
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
  ownBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#0B1F3A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  ownTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  statusBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#18A8E0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  statusTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
});