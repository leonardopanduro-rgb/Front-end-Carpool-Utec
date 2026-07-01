import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { usePublications } from '../hooks/usePublications';
import { useRequests } from '../hooks/useRequests';
import { useRides } from '../hooks/useRides';
import { useAuth } from '../hooks/useAuth';
import { TripCard } from '../components/TripCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { DISTRICT_NAMES } from '../data/limaPlaces';
import { isPast } from '../utils/formatters';

type Direction = 'all' | 'fromUTEC';

export const SearchTripsScreen = ({ navigation }: any) => {
  const { publications, loading, error, fetch } = usePublications();
  const { requests, fetch: fetchReqs } = useRequests();
  const { user } = useAuth();
  const { myRides, fetch: fetchRides } = useRides(user?.id ?? null);
  const [direction, setDirection] = React.useState<Direction>('all');
  const [district, setDistrict] = React.useState('');
  const [query, setQuery] = React.useState('');

  useFocusEffect(
    useCallback(() => { fetch(); fetchReqs(); fetchRides(); }, [fetch, fetchReqs, fetchRides])
  );

  const takenPubIds = new Set<number>([
    ...myRides.map(m => m.ride.publicationId),
    ...requests
      .filter(r => r.requesterId === user?.id && (r.status === 'PENDING' || r.status === 'ACCEPTED'))
      .map(r => r.publicationId),
  ]);

  const q = query.trim().toLowerCase();
  const filtered = publications.filter(p => {
    if (p.authorId === user?.id) return false;
    if (takenPubIds.has(p.id)) return false;
    if (!p.driverToPassenger) return false;
    if (p.seats <= 0) return false;
    if (isPast(p.departureTime)) return false;
    if (direction === 'fromUTEC' && !p.fromUTEC) return false;
    if (district && !p.destinationOrOrigin.toLowerCase().includes(district.toLowerCase())) return false;
    if (q && !`${p.titulo} ${p.destinationOrOrigin}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const Chip = ({ label, active, onPress }: any) => (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipTxt, active && styles.chipActiveTxt]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.filtersWrap}>
        <TextInput
          style={styles.search}
          placeholder="Buscar por destino o referencia..."
          placeholderTextColor="#8A9BB0"
          value={query}
          onChangeText={setQuery}
        />
        <Text style={styles.filterLabel}>Sentido</Text>
        <View style={styles.chipRow}>
          <Chip label="Todos" active={direction === 'all'} onPress={() => setDirection('all')} />
          <Chip label="Saliendo de UTEC" active={direction === 'fromUTEC'} onPress={() => setDirection('fromUTEC')} />
        </View>
        <Text style={styles.filterLabel}>Distrito</Text>
        <View style={styles.chipRow}>
          <Chip label="Todos" active={district === ''} onPress={() => setDistrict('')} />
          {DISTRICT_NAMES.map(d => <Chip key={d} label={d} active={district === d} onPress={() => setDistrict(d === district ? '' : d)} />)}
        </View>
      </View>
      {loading ? <LoadingState /> : error ? <ErrorMessage error={error} onRetry={fetch} /> :
        <FlatList
          data={filtered}
          keyExtractor={p => String(p.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TripCard pub={item}
              onPress={() => navigation.navigate('TripDetail', { publicationId: item.id })} />
          )}
          ListEmptyComponent={<EmptyState title="No hay viajes disponibles" subtitle="Prueba cambiando los filtros o la busqueda" />}
        />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F7' },
  filtersWrap: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#D0D9E8' },
  search: { borderWidth: 1.5, borderColor: '#D0D9E8', borderRadius: 10, height: 44, paddingHorizontal: 14, color: '#0B1F3A', marginBottom: 12 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#0B1F3A', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: { borderRadius: 20, borderWidth: 1.5, borderColor: '#D0D9E8', paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#0B1F3A', borderColor: '#0B1F3A' },
  chipTxt: { color: '#0B1F3A', fontSize: 12, fontWeight: '600' },
  chipActiveTxt: { color: '#fff' },
  list: { padding: 16 },
});
