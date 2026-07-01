import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { usePublications } from '../hooks/usePublications';
import { publicationService } from '../services/publication';
import { requestPublicationService } from '../services/requestPublication';
import { Publication } from '../types/publication';
import { RequestPublication } from '../types/requestPublication';
import { DriverRequestCard } from '../components/DriverRequestCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { parseAxiosError } from '../utils/errorMessages';
import { formatPricePerSeat } from '../utils/formatters';

interface PubWithRequests {
  pub: Publication;
  requests: RequestPublication[];
  loadingReqs: boolean;
}

export const DriverPanelScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { publications, loading, error, fetch } = usePublications();
  const [pubData, setPubData] = useState<PubWithRequests[]>([]);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const myPubs = publications.filter(p => p.authorId === user?.id);
    const init: PubWithRequests[] = myPubs.map(p => ({ pub: p, requests: [], loadingReqs: true }));
    setPubData(init);
    myPubs.forEach(async (p) => {
      try {
        const reqs = await publicationService.getRequests(p.id);
        setPubData(prev => prev.map(d => d.pub.id === p.id ? { ...d, requests: reqs, loadingReqs: false } : d));
      } catch {
        setPubData(prev => prev.map(d => d.pub.id === p.id ? { ...d, loadingReqs: false } : d));
      }
    });
  }, [publications, user?.id]);

  const initiateAccept = async (req: RequestPublication, pub: Publication) => {
    if (!pub.vehicleId) {
      Alert.alert('Error', 'La publicacion no tiene vehiculo asignado.');
      return;
    }
    const vehicleId = pub.vehicleId;
    Alert.alert(
      'Aceptar solicitud',
      `Aceptar esta solicitud ocupara ${req.requestedSeats} de tus ${pub.seats} cupos. Precio por asiento: ${formatPricePerSeat(pub.pricePerSeat)}. Confirmar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aceptar solicitud', onPress: () => doAccept(req, vehicleId) },
      ]
    );
  };

  const doAccept = async (req: RequestPublication, vehicleId: number) => {
    const key = `accept-${req.id}`;
    setProcessing(p => ({ ...p, [key]: true }));
    try {
      const updated = await requestPublicationService.accept(req.id, { vehicleId });
      setPubData(prev => prev.map(d => ({ ...d, requests: d.requests.map(r => r.id === req.id ? updated : r) })));
    } catch (e: any) {
      Alert.alert('Error al aceptar', parseAxiosError(e).message);
    } finally {
      setProcessing(p => ({ ...p, [key]: false }));
    }
  };

  const handleReject = async (req: RequestPublication) => {
    const key = `reject-${req.id}`;
    setProcessing(p => ({ ...p, [key]: true }));
    try {
      const updated = await requestPublicationService.reject(req.id);
      setPubData(prev => prev.map(d => ({ ...d, requests: d.requests.map(r => r.id === req.id ? updated : r) })));
    } catch (e: any) {
      Alert.alert('Error al rechazar', parseAxiosError(e).message);
    } finally {
      setProcessing(p => ({ ...p, [key]: false }));
    }
  };

  if (loading) return <LoadingState message="Cargando tus publicaciones..." />;
  if (error) return <SafeAreaView style={s.safe}><ErrorMessage error={error} onRetry={fetch} /></SafeAreaView>;

  const myPubData = pubData.filter(d => d.pub.authorId === user?.id);

  const renderPub = ({ pub, requests, loadingReqs }: PubWithRequests) => (
    <View key={pub.id} style={s.pubSection}>
      <TouchableOpacity
        style={s.pubHeader}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('TripDetail', { publicationId: pub.id })}
      >
        <View style={{ flex: 1 }}>
          <Text style={s.pubTitle} numberOfLines={1}>{pub.titulo}</Text>
          <Text style={s.pubPrice}>{formatPricePerSeat(pub.pricePerSeat)} por asiento</Text>
        </View>
        <Text style={s.pubMeta}>Ver detalle</Text>
      </TouchableOpacity>
      {loadingReqs
        ? <LoadingState message="Cargando solicitudes..." />
        : requests.length === 0
          ? <Text style={s.noReqs}>Sin solicitudes aun</Text>
          : requests.map(req => (
            <DriverRequestCard key={req.id} req={req}
              pricePerSeat={pub.pricePerSeat}
              onAccept={() => initiateAccept(req, pub)}
              onReject={() => handleReject(req)}
              accepting={!!processing[`accept-${req.id}`]}
              rejecting={!!processing[`reject-${req.id}`]} />
          ))}
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}><Text style={s.title}>Panel de solicitudes</Text></View>

      {myPubData.length === 0
        ? <EmptyState title="Sin publicaciones" subtitle="Publica un viaje para gestionar solicitudes"
          ctaLabel="Publicar viaje" onCta={() => navigation.navigate('PublishTrip')} />
        : <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.groupTitle}>Solicitudes recibidas en mis viajes</Text>
          {myPubData.map(renderPub)}
        </ScrollView>}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F7' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#0B1F3A' },
  scroll: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  groupTitle: { fontSize: 15, fontWeight: '800', color: '#0B1F3A', marginBottom: 12, marginTop: 4 },
  pubSection: { marginBottom: 24 },
  pubHeader: { backgroundColor: '#0B1F3A', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pubTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  pubPrice: { color: '#D0D9E8', fontSize: 12, marginTop: 2 },
  pubMeta: { color: '#18A8E0', fontSize: 12, fontWeight: '600', marginLeft: 10 },
  noReqs: { color: '#8A9BB0', fontSize: 13, fontStyle: 'italic', paddingLeft: 4 },
});
