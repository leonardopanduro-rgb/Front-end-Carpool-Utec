import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { usePublications } from '../hooks/usePublications';
import { publicationService } from '../services/publication';
import { requestPublicationService } from '../services/requestPublication';
import { vehicleService } from '../services/vehicle';
import { Publication } from '../types/publication';
import { RequestPublication } from '../types/requestPublication';
import { Vehicle } from '../types/vehicle';
import { DriverRequestCard } from '../components/DriverRequestCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { AppButton } from '../components/AppButton';
import { parseAxiosError } from '../utils/errorMessages';

interface PubWithRequests { pub: Publication; requests: RequestPublication[]; loadingReqs: boolean; }

export const DriverPanelScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { publications, loading, error, fetch } = usePublications();
  const [pubData, setPubData] = useState<PubWithRequests[]>([]);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  // Vehicle selector modal state
  const [vehicleModal, setVehicleModal] = useState(false);
  const [pendingAccept, setPendingAccept] = useState<{ req: RequestPublication; pub: Publication } | null>(null);
  const [requesterVehicles, setRequesterVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => { fetch(); }, []);

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
    if (pub.driverToPassenger) {
      // Author is driver — use pub.vehicleId directly, no modal needed
      if (!pub.vehicleId) { Alert.alert('Error', 'La publicación no tiene vehículo asignado.'); return; }
      doAccept(req, pub.vehicleId);
    } else {
      // Requester is driver — show their vehicles for selection
      setLoadingVehicles(true);
      try {
        const all = await vehicleService.getAll();
        const rv = all.filter(v => v.ownerId === req.requesterId);
        if (rv.length === 0) { Alert.alert('Sin vehículo', 'El solicitante no tiene vehículos registrados.'); return; }
        setRequesterVehicles(rv);
        setSelectedVehicleId(rv[0].id);
        setPendingAccept({ req, pub });
        setVehicleModal(true);
      } catch (e: any) {
        Alert.alert('Error', parseAxiosError(e).message);
      } finally {
        setLoadingVehicles(false);
      }
    }
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

  const confirmAcceptWithVehicle = () => {
    if (!pendingAccept || !selectedVehicleId) return;
    setVehicleModal(false);
    doAccept(pendingAccept.req, selectedVehicleId);
    setPendingAccept(null);
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

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}><Text style={s.title}>Panel de solicitudes</Text></View>

      {myPubData.length === 0
        ? <EmptyState title="Sin publicaciones" subtitle="Publica un viaje para gestionar solicitudes"
            ctaLabel="Publicar viaje" onCta={() => navigation.navigate('PublishTrip')} />
        : <ScrollView contentContainerStyle={s.scroll}>
            {myPubData.map(({ pub, requests, loadingReqs }) => (
              <View key={pub.id} style={s.pubSection}>
                <View style={s.pubHeader}>
                  <Text style={s.pubTitle} numberOfLines={1}>{pub.titulo}</Text>
                  <Text style={s.pubMeta}>{pub.driverToPassenger ? '🚗 Conductor' : '🙋 Pasajero'}</Text>
                </View>
                {loadingReqs
                  ? <LoadingState message="Cargando solicitudes..." />
                  : requests.length === 0
                    ? <Text style={s.noReqs}>Sin solicitudes aún</Text>
                    : requests.map(req => (
                        <DriverRequestCard key={req.id} req={req}
                          onAccept={() => initiateAccept(req, pub)}
                          onReject={() => handleReject(req)}
                          accepting={!!processing[`accept-${req.id}`] || loadingVehicles}
                          rejecting={!!processing[`reject-${req.id}`]} />
                      ))}
              </View>
            ))}
          </ScrollView>}

      {/* Vehicle selector modal for requester-driver case */}
      <Modal visible={vehicleModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Seleccionar vehículo del conductor</Text>
            <Text style={s.modalSub}>Vehículos registrados por el solicitante:</Text>
            {requesterVehicles.map(v => (
              <TouchableOpacity key={v.id}
                style={[s.vehicleOpt, selectedVehicleId === v.id && s.vehicleOptActive]}
                onPress={() => setSelectedVehicleId(v.id)}>
                <Text style={s.vehicleOptPlate}>{v.plate}</Text>
                <Text style={s.vehicleOptDetail}>{v.brand} {v.model} · {v.color} · {v.seats} asientos</Text>
              </TouchableOpacity>
            ))}
            <View style={s.modalActions}>
              <AppButton title="Confirmar aceptar" onPress={confirmAcceptWithVehicle} />
              <AppButton title="Cancelar" onPress={() => { setVehicleModal(false); setPendingAccept(null); }}
                variant="outline" style={{ marginTop: 10 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  header:{padding:20,paddingBottom:8},
  title:{fontSize:22,fontWeight:'800',color:'#0B1F3A'},
  scroll:{padding:20,paddingTop:8,paddingBottom:40},
  pubSection:{marginBottom:24},
  pubHeader:{backgroundColor:'#0B1F3A',borderRadius:12,padding:14,marginBottom:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  pubTitle:{color:'#fff',fontSize:14,fontWeight:'700',flex:1},
  pubMeta:{color:'#18A8E0',fontSize:12,fontWeight:'600'},
  noReqs:{color:'#8A9BB0',fontSize:13,fontStyle:'italic',paddingLeft:4},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.55)',justifyContent:'flex-end'},
  modalCard:{backgroundColor:'#fff',borderTopLeftRadius:20,borderTopRightRadius:20,padding:24},
  modalTitle:{fontSize:18,fontWeight:'800',color:'#0B1F3A',marginBottom:6},
  modalSub:{fontSize:13,color:'#8A9BB0',marginBottom:16},
  vehicleOpt:{borderWidth:1.5,borderColor:'#D0D9E8',borderRadius:10,padding:14,marginBottom:8,backgroundColor:'#F2F4F7'},
  vehicleOptActive:{borderColor:'#18A8E0',backgroundColor:'#E8F7FD'},
  vehicleOptPlate:{fontSize:16,fontWeight:'800',color:'#0B1F3A',letterSpacing:1},
  vehicleOptDetail:{fontSize:13,color:'#4A5568',marginTop:2},
  modalActions:{marginTop:8},
});