import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRequests } from '../hooks/useRequests';
import { useAuth } from '../hooks/useAuth';
import { requestPublicationService } from '../services/requestPublication';
import { RequestCard } from '../components/RequestCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { parseAxiosError } from '../utils/errorMessages';
import { RequestPublication } from '../types/requestPublication';
import { Alert } from 'react-native';

export const MyRequestsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { requests, setRequests, loading, error, fetch } = useRequests();
  const [cancelling, setCancelling] = useState<number|null>(null);

  useEffect(() => { fetch(); }, []);
  const mine = requests.filter(r => r.requesterId === user?.id);

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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}><Text style={styles.title}>Mis solicitudes</Text></View>
      {loading ? <LoadingState /> : error ? <ErrorMessage error={error} onRetry={fetch} /> :
        <FlatList
          data={mine} keyExtractor={r=>String(r.id)} contentContainerStyle={styles.list}
          renderItem={({item})=>(
            <RequestCard req={item}
              onCancel={item.status==='PENDING'?()=>handleCancel(item):undefined}
              cancelling={cancelling===item.id} />
          )}
          ListEmptyComponent={
            <EmptyState title="Sin solicitudes" subtitle="Busca un viaje y solicita un asiento"
              ctaLabel="Buscar viajes" onCta={()=>navigation.navigate('SearchTrips')} />
          }
        />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  header:{padding:20,paddingBottom:8},
  title:{fontSize:22,fontWeight:'800',color:'#0B1F3A'},
  list:{padding:20,paddingTop:8},
});