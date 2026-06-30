import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rideService } from '../services/ride';
import { ridePassengerService } from '../services/ridePassenger';
import { vehicleService } from '../services/vehicle';
import { useAuth } from '../hooks/useAuth';
import { Ride } from '../types/ride';
import { RidePassenger } from '../types/ridePassenger';
import { Vehicle } from '../types/vehicle';
import { AppButton } from '../components/AppButton';
import { RouteMap, MapPoint } from '../components/RouteMap';
import { UTEC } from '../data/utec';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { AppError } from '../types/apiError';
import { formatDateTime, isPast } from '../utils/formatters';

const Row = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{icon} {label}</Text>
    <Text style={s.rowValue}>{value}</Text>
  </View>
);

export const ConfirmedTripScreen = ({ route, navigation }: any) => {
  const { rideId } = route.params;
  const { user } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [passengers, setPassengers] = useState<RidePassenger[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await rideService.getById(rideId);
      setRide(r);
      const allPass = await ridePassengerService.getAll();
      setPassengers(allPass.filter(p => p.rideId === rideId));
      try {
        const allVehicles = await vehicleService.getAll();
        setVehicle(allVehicles.find(v => v.id === r.vehicleId) ?? null);
      } catch { /* el vehículo es opcional para la vista */ }
    } catch (e) { setError(e as AppError); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingState message="Cargando viaje..." />;
  if (error) return <SafeAreaView style={s.safe}><ErrorMessage error={error} onRetry={load} /></SafeAreaView>;
  if (!ride) return null;

  const isDriver = ride.driverId === user?.id;
  const past = isPast(ride.departureTime);

  const fmtQ = (q: string) => encodeURIComponent(`${q}, Lima, Peru`);
  const utecQ = `${UTEC.lat},${UTEC.lng}`;
  const mapOrigin: MapPoint = ride.fromUTEC ? UTEC : ride.destinationOrOrigin;
  const mapDestination: MapPoint = ride.fromUTEC ? ride.destinationOrOrigin : UTEC;

  // Prefiere las coordenadas exactas de la parada; si no, usa el texto geocodificable.
  const pointOf = (p: RidePassenger): MapPoint | null =>
    (p.pickupLatitude != null && p.pickupLongitude != null)
      ? { lat: p.pickupLatitude, lng: p.pickupLongitude }
      : (p.pickupPoint && p.pickupPoint.trim() ? p.pickupPoint : null);
  const queryOf = (p: RidePassenger): string =>
    (p.pickupLatitude != null && p.pickupLongitude != null) ? `${p.pickupLatitude},${p.pickupLongitude}` : fmtQ(p.pickupPoint || '');

  const waypoints: MapPoint[] = passengers.map(pointOf).filter((w): w is MapPoint => w != null);

  const openMap = () => {
    const o = ride.fromUTEC ? utecQ : fmtQ(ride.destinationOrOrigin);
    const d = ride.fromUTEC ? fmtQ(ride.destinationOrOrigin) : utecQ;
    const wp = passengers.map(queryOf).filter(Boolean).join('|');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=driving${wp ? `&waypoints=${wp}` : ''}`;
    Linking.openURL(url).catch(() => Alert.alert('No se pudo abrir el mapa'));
  };
  const openPoint = (p: RidePassenger) =>
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${queryOf(p)}`).catch(() => Alert.alert('No se pudo abrir el mapa'));
  const chatSoon = () => Alert.alert('Próximamente', 'El chat estará disponible pronto. Coordina por tus medios habituales mientras tanto.');
  const cancelTrip = () => Alert.alert('Cancelar viaje',
    'La cancelación de viajes estará disponible pronto. Avisa a los participantes mientras tanto.');
  const markCompleted = () => { setCompleted(true); Alert.alert('Viaje completado', 'Marcaste el viaje como completado. Ya puedes calificar a los participantes.'); };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.badge}><Text style={s.badgeTxt}>{isDriver ? '🚗 Eres el conductor' : '🙋 Eres pasajero'}</Text></View>

        <View style={s.card}>
          <Row icon="🧭" label="Ruta" value={ride.fromUTEC ? `UTEC → ${ride.destinationOrOrigin}` : `${ride.destinationOrOrigin} → UTEC`} />
          <Row icon="🕐" label="Salida" value={formatDateTime(ride.departureTime)} />
          {vehicle && <Row icon="🚙" label="Vehículo" value={`${vehicle.brand} ${vehicle.model} · ${vehicle.plate}`} />}
          {!isDriver && <Row icon="🎓" label="Conductor" value={`Estudiante UTEC #${ride.driverId}`} />}
        </View>

        <Text style={s.section}>Ruta y paradas</Text>
        <RouteMap origin={mapOrigin} destination={mapDestination} waypoints={waypoints} height={260} />

        {isDriver && (
          <>
            <Text style={s.section}>Pasajeros confirmados ({passengers.length})</Text>
            {passengers.length === 0
              ? <Text style={s.empty}>Aún no hay pasajeros confirmados.</Text>
              : passengers.map(p => (
                <View key={p.id} style={s.passCard}>
                  <Text style={s.passName}>🙋 {p.passengerName?.trim() || `Estudiante UTEC #${p.passengerId}`}</Text>
                  {(p.passengerCareer || p.passengerRating != null) ? (
                    <Text style={s.passMeta}>
                      {[p.passengerCareer ? p.passengerCareer.replace(/_/g, ' ') : null,
                        p.passengerRating != null ? `⭐ ${p.passengerRating.toFixed(1)}` : null]
                        .filter(Boolean).join('  ·  ')}
                    </Text>
                  ) : null}
                  <Text style={s.passInfo}>💺 {p.seatsReserved} asiento(s) · 📍 {p.pickupPoint}</Text>
                  <View style={s.passActions}>
                    <AppButton title="Ver punto" onPress={() => openPoint(p)} variant="outline" style={s.flexBtn} />
                    <AppButton title="Chat" onPress={chatSoon} variant="outline" style={s.flexBtn} />
                  </View>
                </View>
              ))}
          </>
        )}

        <View style={s.actions}>
          <AppButton title="Abrir mapa" onPress={openMap} />
          {!isDriver && <AppButton title="Chat con el conductor" onPress={chatSoon} variant="outline" style={s.mt} />}
          {isDriver && !past && !completed && <AppButton title="Marcar como completado" onPress={markCompleted} variant="secondary" style={s.mt} />}
          {(past || completed) && <AppButton title="⭐ Calificar participantes" onPress={() => navigation.navigate('Review', { rideId })} variant="secondary" style={s.mt} />}
          <AppButton title="Cancelar viaje" onPress={cancelTrip} variant="danger" style={s.mt} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F7' },
  scroll: { padding: 20, paddingBottom: 40 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E8F7FD', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16 },
  badgeTxt: { color: '#18A8E0', fontWeight: '800', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, marginBottom: 20, shadowColor: '#0B1F3A', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F4F7' },
  rowLabel: { color: '#8A9BB0', fontSize: 13 },
  rowValue: { color: '#0B1F3A', fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  section: { fontSize: 15, fontWeight: '800', color: '#0B1F3A', marginBottom: 12 },
  empty: { color: '#8A9BB0', fontSize: 13, fontStyle: 'italic', marginBottom: 12 },
  passCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#18A8E0' },
  passName: { fontSize: 14, fontWeight: '700', color: '#0B1F3A', marginBottom: 4 },
  passMeta: { fontSize: 12, color: '#8A9BB0', fontWeight: '600', marginBottom: 6 },
  passInfo: { fontSize: 13, color: '#4A5568', marginBottom: 10 },
  passActions: { flexDirection: 'row', gap: 10 },
  flexBtn: { flex: 1 },
  actions: { marginTop: 8 },
  mt: { marginTop: 10 },
});
