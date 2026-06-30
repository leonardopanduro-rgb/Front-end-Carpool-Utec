import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRequests } from '../hooks/useRequests';
import { useAuth } from '../hooks/useAuth';
import { requestPublicationService } from '../services/requestPublication';
import { publicationService } from '../services/publication';
import { vehicleService } from '../services/vehicle';
import { RequestCard } from '../components/RequestCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { parseAxiosError } from '../utils/errorMessages';
import { RequestPublication, RequestStatus } from '../types/requestPublication';

type Tab = RequestStatus;
const TABS: { key: Tab; label: string }[] = [
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'COUNTERED', label: 'Contraofertas' },
  { key: 'ACCEPTED', label: 'Aceptadas' },
  { key: 'REJECTED', label: 'Rechazadas' },
  { key: 'CANCELLED', label: 'Canceladas' },
];

const EMPTY: Record<Tab, string> = {
  PENDING: 'Aún no tienes solicitudes pendientes. Busca un viaje desde UTEC para empezar.',
  COUNTERED: 'No tienes contraofertas. Cuando un conductor proponga otra tarifa, aparecerá aquí.',
  ACCEPTED: 'No tienes solicitudes aceptadas todavía.',
  REJECTED: 'No tienes solicitudes rechazadas.',
  CANCELLED: 'No tienes solicitudes canceladas.',
};

export const MyRequestsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { requests, setRequests, loading, error, fetch } = useRequests();
  const [cancelling, setCancelling] = useState<number|null>(null);
  const [accepting, setAccepting] = useState<number|null>(null);
  const [tab, setTab] = useState<Tab>('PENDING');

  useFocusEffect(useCallback(() => { fetch(); }, [fetch]));

  const mine = requests.filter(r => r.requesterId === user?.id);
  const shown = mine.filter(r => r.status === tab);
  const countBy = (s: RequestStatus) => mine.filter(r => r.status === s).length;

  const handleCancel = async (req: RequestPublication) => {
    Alert.alert('Cancelar solicitud','¿Seguro que quieres cancelar?',[
      {text:'No',style:'cancel'},
      {text:'Sí, cancelar',style:'destructive',onPress:async()=>{
        setCancelling(req.id);
        try {
          const updated = await requestPublicationService.cancel(req.id);
          setRequests(prev => prev.map(r => r.id === req.id ? updated : r));
        } catch(e:any){ Alert.alert('Error',parseAxiosError(e).message); }
        finally{ setCancelling(null); }
      }},
    ]);
  };

  const handleAcceptCounter = async (req: RequestPublication) => {
    setAccepting(req.id);
    try {
      const pub = await publicationService.getById(req.publicationId);
      let vehicleId: number | undefined;
      if (pub.driverToPassenger) {
        vehicleId = pub.vehicleId ?? undefined;
      } else {
        const vs = await vehicleService.getAll();
        vehicleId = vs.find(v => v.ownerId === user?.id)?.id;
      }
      const updated = await requestPublicationService.acceptCounter(req.id, vehicleId);
      setRequests(prev => prev.map(r => r.id === req.id ? updated : r));
      Alert.alert('Tarifa aceptada', 'Aceptaste la contraoferta. ¡Viaje confirmado!');
    } catch (e: any) { Alert.alert('Error', parseAxiosError(e).message); }
    finally { setAccepting(null); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}><Text style={styles.title}>Mis solicitudes</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab===t.key && styles.tabActive]} onPress={()=>setTab(t.key)}>
            <Text style={[styles.tabTxt, tab===t.key && styles.tabTxtActive]}>{t.label} ({countBy(t.key)})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading ? <LoadingState /> : error ? <ErrorMessage error={error} onRetry={fetch} /> :
        <FlatList
          data={shown} keyExtractor={r=>String(r.id)} contentContainerStyle={styles.list}
          renderItem={({item})=>(
            <RequestCard req={item}
              onViewPublication={()=>navigation.navigate('TripDetail',{publicationId:item.publicationId})}
              onCancel={(item.status==='PENDING'||item.status==='COUNTERED')?()=>handleCancel(item):undefined}
              cancelling={cancelling===item.id}
              onAcceptCounter={item.status==='COUNTERED'?()=>handleAcceptCounter(item):undefined}
              accepting={accepting===item.id} />
          )}
          ListEmptyComponent={
            <EmptyState title="Sin solicitudes" subtitle={EMPTY[tab]}
              ctaLabel={tab==='PENDING' ? 'Buscar viajes' : undefined}
              onCta={tab==='PENDING' ? ()=>navigation.navigate('SearchTrips') : undefined} />
          }
        />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  header:{padding:20,paddingBottom:8},
  title:{fontSize:22,fontWeight:'800',color:'#0B1F3A'},
  tabs:{flexDirection:'row',gap:8,paddingHorizontal:20,paddingBottom:12},
  tab:{borderRadius:20,borderWidth:1.5,borderColor:'#D0D9E8',paddingHorizontal:12,paddingVertical:6,backgroundColor:'#fff'},
  tabActive:{backgroundColor:'#0B1F3A',borderColor:'#0B1F3A'},
  tabTxt:{color:'#0B1F3A',fontSize:12,fontWeight:'700'},
  tabTxtActive:{color:'#fff'},
  list:{padding:20,paddingTop:8,flexGrow:1},
});
