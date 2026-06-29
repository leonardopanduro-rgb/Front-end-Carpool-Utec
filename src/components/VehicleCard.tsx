import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Vehicle } from '../types/vehicle';

interface Props { vehicle: Vehicle; onEdit?: () => void; onDelete?: () => void; tags?: string[]; }

export const VehicleCard: React.FC<Props> = ({ vehicle, onEdit, onDelete, tags }) => (
  <View style={styles.card}>
    <View style={styles.top}>
      <View style={{ flex: 1 }}>
        <View style={styles.plateRow}>
          <Text style={styles.plate}>{vehicle.plate}</Text>
          {tags?.map(t => <View key={t} style={styles.tag}><Text style={styles.tagTxt}>{t}</Text></View>)}
        </View>
        <Text style={styles.detail}>{vehicle.brand} {vehicle.model} · {vehicle.color}</Text>
        <Text style={styles.seats}>💺 {vehicle.seats} asientos</Text>
      </View>
      <Text style={styles.icon}>🚗</Text>
    </View>
    <View style={styles.actions}>
      {onEdit && <TouchableOpacity style={styles.btnEdit} onPress={onEdit}><Text style={styles.editTxt}>Editar</Text></TouchableOpacity>}
      {onDelete && <TouchableOpacity style={styles.btnDel} onPress={onDelete}><Text style={styles.delTxt}>Eliminar</Text></TouchableOpacity>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#0B1F3A', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  plateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: '#E8F7FD', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  tagTxt: { color: '#18A8E0', fontSize: 10, fontWeight: '800' },
  plate: { fontSize: 20, fontWeight: '800', color: '#0B1F3A', letterSpacing: 1 },
  detail: { fontSize: 14, color: '#4A5568', marginTop: 2 },
  seats: { fontSize: 13, color: '#8A9BB0', marginTop: 4 },
  icon: { fontSize: 36 },
  actions: { flexDirection: 'row', gap: 10 },
  btnEdit: { flex: 1, borderWidth: 1.5, borderColor: '#18A8E0', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  btnDel: { flex: 1, borderWidth: 1.5, borderColor: '#E53E3E', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  editTxt: { color: '#18A8E0', fontWeight: '700', fontSize: 13 },
  delTxt: { color: '#E53E3E', fontWeight: '700', fontSize: 13 },
});