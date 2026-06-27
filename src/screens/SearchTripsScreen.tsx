import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePublications } from '../hooks/usePublications';
import { useAuth } from '../hooks/useAuth';
import { TripCard } from '../components/TripCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { DISTRICT_NAMES } from '../data/limaPlaces';
import { Publication } from '../types/publication';

type Direction = 'all'|'fromUTEC'|'toUTEC';
type Kind = 'all'|'offers'|'seeks';

export const SearchTripsScreen = ({ navigation }: any) => {
  const { publications, loading, error, fetch } = usePublications();
  const { user } = useAuth();
  const [direction, setDirection] = useState<Direction>('all');
  const [kind, setKind] = useState<Kind>('all');
  const [district, setDistrict] = useState('');

  useEffect(() => { fetch(); }, []);

  const filtered = publications.filter(p => {
    if (direction === 'fromUTEC' && !p.fromUTEC) return false;
    if (direction === 'toUTEC' && p.fromUTEC) return false;
    if (kind === 'offers' && !p.driverToPassenger) return false;
    if (kind === 'seeks' && p.driverToPassenger) return false;
    if (district && !p.destinationOrOrigin.toLowerCase().includes(district.toLowerCase())) return false;
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
        <Text style={styles.filterLabel}>Sentido</Text>
        <View style={styles.chipRow}>
          <Chip label="Todos" active={direction==='all'} onPress={()=>setDirection('all')} />
          <Chip label="Saliendo de UTEC" active={direction==='fromUTEC'} onPress={()=>setDirection('fromUTEC')} />
          <Chip label="Hacia campus" active={direction==='toUTEC'} onPress={()=>setDirection('toUTEC')} />
        </View>
        <Text style={styles.filterLabel}>Tipo</Text>
        <View style={styles.chipRow}>
          <Chip label="Todos" active={kind==='all'} onPress={()=>setKind('all')} />
          <Chip label="Ofrece asiento" active={kind==='offers'} onPress={()=>setKind('offers')} />
          <Chip label="Busca conductor" active={kind==='seeks'} onPress={()=>setKind('seeks')} />
        </View>
        <Text style={styles.filterLabel}>Distrito</Text>
        <View style={styles.chipRow}>
          <Chip label="Todos" active={district===''} onPress={()=>setDistrict('')} />
          {DISTRICT_NAMES.map(d => <Chip key={d} label={d} active={district===d} onPress={()=>setDistrict(d===district?'':d)} />)}
        </View>
      </View>
      {loading ? <LoadingState /> : error ? <ErrorMessage error={error} onRetry={fetch} /> :
        <FlatList
          data={filtered}
          keyExtractor={p=>String(p.id)}
          contentContainerStyle={styles.list}
          renderItem={({item})=>(
            <TripCard pub={item} isOwn={item.authorId===user?.id}
              onPress={()=>navigation.navigate('TripDetail',{publicationId:item.id})} />
          )}
          ListEmptyComponent={<EmptyState title="No hay viajes disponibles" subtitle="Prueba cambiando los filtros" />}
        />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  filtersWrap:{padding:16,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#D0D9E8'},
  filterLabel:{fontSize:12,fontWeight:'700',color:'#0B1F3A',marginBottom:6},
  chipRow:{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:10},
  chip:{borderRadius:20,borderWidth:1.5,borderColor:'#D0D9E8',paddingHorizontal:10,paddingVertical:4,backgroundColor:'#fff'},
  chipActive:{backgroundColor:'#0B1F3A',borderColor:'#0B1F3A'},
  chipTxt:{color:'#0B1F3A',fontSize:12,fontWeight:'600'},
  chipActiveTxt:{color:'#fff'},
  list:{padding:16},
});