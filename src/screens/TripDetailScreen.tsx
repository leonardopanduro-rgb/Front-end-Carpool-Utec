import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { publicationService } from '../services/publication';
import { requestPublicationService } from '../services/requestPublication';
import { userService } from '../services/user';
import { weatherService, WeatherInfo } from '../services/weather';
import { useAuth } from '../hooks/useAuth';
import { Publication } from '../types/publication';
import { PublicUser } from '../types/user';
import { AppButton } from '../components/AppButton';
import { RouteMap, MapPoint } from '../components/RouteMap';
import { UTEC } from '../data/utec';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDateTime, formatDistance, formatPricePerSeat, formatSeatsTotal, isPast } from '../utils/formatters';
import { parseAxiosError } from '../utils/errorMessages';
import { AppError } from '../types/apiError';
import { RequestPublication } from '../types/requestPublication';

export const TripDetailScreen = ({ route, navigation }: any) => {
  const { publicationId } = route.params;
  const { user } = useAuth();
  const [pub, setPub] = useState<Publication | null>(null);
  const [author, setAuthor] = useState<PublicUser | null>(null);
  const [requests, setRequests] = useState<RequestPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [seats, setSeats] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    load();
    weatherService.getCurrent().then(setWeather);
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await publicationService.getById(publicationId);
      setPub(p);
      const [publicProfile, allRequests] = await Promise.all([
        userService.getPublicProfile(p.authorId).catch(() => null),
        requestPublicationService.getAll().catch(() => [] as RequestPublication[]),
      ]);
      setAuthor(publicProfile);
      setRequests(allRequests);
      setSubmitted(allRequests.some(r =>
        r.publicationId === p.id &&
        r.requesterId === user?.id &&
        (r.status === 'PENDING' || r.status === 'ACCEPTED')
      ));
    } catch (e) {
      setError(e as AppError);
    } finally {
      setLoading(false);
    }
  };

  const isOwn = pub?.authorId === user?.id;
  const requestedSeats = Number(seats);
  const tripAlreadyLeft = pub ? isPast(pub.departureTime) : false;
  const noSeatsLeft = pub ? pub.seats <= 0 : false;
  const hasPendingRequest = useMemo(() => {
    if (!pub || !user) return false;
    return requests.some(r => r.publicationId === pub.id && r.requesterId === user.id && r.status === 'PENDING');
  }, [pub, requests, user]);

  const validationMessage = useMemo(() => {
    if (!pub) return null;
    if (tripAlreadyLeft) return 'Este viaje ya salio.';
    if (noSeatsLeft) return 'Este viaje ya no tiene asientos disponibles.';
    if (hasPendingRequest) return 'Ya tienes una solicitud pendiente para este viaje.';
    if (!Number.isInteger(requestedSeats) || requestedSeats <= 0) return 'Selecciona al menos 1 asiento.';
    if (requestedSeats > pub.seats) return `Solo hay ${pub.seats} asiento(s) disponible(s).`;
    return null;
  }, [pub, tripAlreadyLeft, noSeatsLeft, hasPendingRequest, requestedSeats]);

  const handleRequest = async () => {
    if (!pub) return;
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }
    setSubmitting(true);
    try {
      await requestPublicationService.create(pub.id, { requestedSeats });
      setSubmitted(true);
      setRequests(prev => [
        ...prev,
        {
          id: Date.now(),
          publicationId: pub.id,
          requesterId: user?.id ?? 0,
          requestedSeats,
          message: '',
          pickupPointOrDestine: '',
          externalLatitude: null,
          externalLongitude: null,
          status: 'PENDING',
          pricePerSeat: pub.pricePerSeat,
        },
      ]);
      Alert.alert('Solicitud enviada', 'Tu solicitud fue enviada. El conductor la revisara pronto.');
    } catch (e: any) {
      Alert.alert('Error al solicitar', parseAxiosError(e).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Cargando viaje..." />;
  if (error) return <SafeAreaView style={s.safe}><ErrorMessage error={error} onRetry={load} /></SafeAreaView>;
  if (!pub) return null;

  const pubPoint: MapPoint = (pub.externalLatitude != null && pub.externalLongitude != null)
    ? { lat: pub.externalLatitude, lng: pub.externalLongitude }
    : pub.destinationOrOrigin;
  const mapOrigin = pub.fromUTEC ? UTEC : pubPoint;
  const mapDestination = pub.fromUTEC ? pubPoint : UTEC;
  const authorName = [author?.name, author?.lastName].filter(Boolean).join(' ').trim();
  const photoUrl = author?.photoUrl || author?.profilePictureUrl || null;
  const disabled = !!validationMessage || submitted;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.dirBadge}>
          <Text style={s.dirTxt}>{pub.fromUTEC ? 'Saliendo de UTEC' : 'Hacia campus'}</Text>
          <Text style={s.kindTxt}>Conductor publica viaje</Text>
        </View>

        <Text style={s.titulo}>{pub.titulo}</Text>
        {pub.descripcion ? <Text style={s.desc}>{pub.descripcion}</Text> : null}

        <View style={s.infoCard}>
          <InfoRow label="Destino/Origen" value={pub.destinationOrOrigin} />
          <InfoRow label="Salida" value={formatDateTime(pub.departureTime)} />
          <InfoRow label="Asientos disponibles" value={String(pub.seats)} />
          <InfoRow label="Precio por asiento" value={formatPricePerSeat(pub.pricePerSeat)} strong />
          {pub.distanceToUtecKm != null && <InfoRow label="Distancia a UTEC" value={formatDistance(pub.distanceToUtecKm)} />}
          {weather && <InfoRow label="Clima en UTEC" value={`${weather.description} ${weather.temperature} C`} />}
        </View>

        {author && (
          <View style={s.profileCard}>
            {photoUrl ? <Image source={{ uri: photoUrl }} style={s.avatar} /> : <View style={s.avatarFallback}><Text style={s.avatarTxt}>{authorName.slice(0, 2).toUpperCase()}</Text></View>}
            <View style={{ flex: 1 }}>
              {authorName ? <Text style={s.profileName}>{authorName}</Text> : null}
              {author.career ? <Text style={s.profileMeta}>{author.career.replace(/_/g, ' ')}</Text> : null}
            </View>
          </View>
        )}

        <Text style={s.routeTitle}>Ruta del viaje</Text>
        <RouteMap origin={mapOrigin} destination={mapDestination} />

        {!isOwn && !submitted && (
          <View style={s.formCard}>
            <Text style={s.formTitle}>Solicitar viaje</Text>
            <Text style={s.priceLabel}>Precio por asiento</Text>
            <Text style={s.priceValue}>{formatPricePerSeat(pub.pricePerSeat)}</Text>

            <View style={s.seatBlock}>
              <Text style={s.seatLabel}>Cantidad de asientos</Text>
              <View style={s.seatRow}>
                {Array.from({ length: Math.max(pub.seats, 0) }, (_, i) => i + 1).map(n => {
                  const active = seats === String(n);
                  return (
                    <TouchableOpacity key={n} style={[s.seatChip, active && s.seatChipActive]} onPress={() => { setSeats(String(n)); setFormError(null); }}>
                      <Text style={[s.seatChipTxt, active && s.seatChipActiveTxt]}>{n}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={s.total}>{formatSeatsTotal(pub.pricePerSeat, requestedSeats)}</Text>
              {(formError || validationMessage) ? <Text style={s.seatErr}>{formError || validationMessage}</Text> : null}
            </View>

            <AppButton title="Solicitar viaje" onPress={handleRequest} loading={submitting} disabled={disabled} />
          </View>
        )}
        {submitted && <View style={s.successBox}><Text style={s.successTxt}>Solicitud enviada. El conductor debe aceptarla.</Text></View>}
        {isOwn && <View style={s.ownNote}><Text style={s.ownNoteTxt}>Esta es tu publicacion. Gestiona solicitudes en el Panel de conductor.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <View style={s.infoRow}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={[s.infoValue, strong && s.infoValueStrong]}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F7' },
  scroll: { padding: 20, paddingBottom: 40 },
  dirBadge: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dirTxt: { color: '#18A8E0', fontWeight: '700', fontSize: 13 },
  kindTxt: { color: '#8A9BB0', fontSize: 13 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#0B1F3A', marginBottom: 8 },
  desc: { fontSize: 14, color: '#4A5568', lineHeight: 22, marginBottom: 16 },
  infoCard: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, marginBottom: 14, shadowColor: '#0B1F3A', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F2F4F7' },
  infoLabel: { color: '#8A9BB0', fontSize: 13 },
  infoValue: { color: '#0B1F3A', fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  infoValueStrong: { fontSize: 16, fontWeight: '800' },
  profileCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#D0D9E8' },
  avatarFallback: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0B1F3A', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#18A8E0', fontSize: 14, fontWeight: '800' },
  profileName: { fontSize: 15, color: '#0B1F3A', fontWeight: '800' },
  profileMeta: { fontSize: 13, color: '#8A9BB0', marginTop: 2 },
  routeTitle: { fontSize: 15, fontWeight: '800', color: '#0B1F3A', marginBottom: 10 },
  formCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, shadowColor: '#0B1F3A', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#0B1F3A', marginBottom: 16 },
  priceLabel: { fontSize: 13, color: '#8A9BB0', fontWeight: '700' },
  priceValue: { fontSize: 24, color: '#0B1F3A', fontWeight: '800', marginTop: 2, marginBottom: 16 },
  seatBlock: { marginBottom: 14 },
  seatLabel: { fontSize: 13, fontWeight: '600', color: '#0B1F3A', marginBottom: 8 },
  seatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seatChip: { minWidth: 44, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: '#D0D9E8', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingHorizontal: 10 },
  seatChipActive: { borderColor: '#18A8E0', backgroundColor: '#18A8E0' },
  seatChipTxt: { fontSize: 16, fontWeight: '800', color: '#0B1F3A' },
  seatChipActiveTxt: { color: '#fff' },
  total: { color: '#0B1F3A', fontSize: 13, fontWeight: '700', marginTop: 10 },
  seatErr: { color: '#E53E3E', fontSize: 12, marginTop: 6 },
  successBox: { backgroundColor: '#F0FFF4', borderRadius: 12, padding: 16, alignItems: 'center' },
  successTxt: { color: '#276749', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  ownNote: { backgroundColor: '#E8F7FD', borderRadius: 10, padding: 14 },
  ownNoteTxt: { color: '#18A8E0', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
