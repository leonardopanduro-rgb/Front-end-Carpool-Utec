import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { publicationService } from '../services/publication';
import { requestPublicationService } from '../services/requestPublication';
import { vehicleService } from '../services/vehicle';
import { weatherService, WeatherInfo } from '../services/weather';
import { useAuth } from '../hooks/useAuth';
import { Publication } from '../types/publication';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDateTime, formatDistance } from '../utils/formatters';
import { parseAxiosError } from '../utils/errorMessages';
import { AppError } from '../types/apiError';

export const TripDetailScreen = ({ route, navigation }: any) => {
  const { publicationId } = route.params;
  const { user } = useAuth();
  const [pub, setPub] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [hasVehicle, setHasVehicle] = useState(false);

  // Request form state
  const [seats, setSeats] = useState('1');
  const [pickup, setPickup] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    load();
    weatherService.getCurrent().then(setWeather);
  }, []);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const p = await publicationService.getById(publicationId);
      setPub(p);
      const vehicles = await vehicleService.getAll();
      setHasVehicle(vehicles.some(v => v.ownerId === user?.id));
    } catch (e) { setError(e as AppError); }
    finally { setLoading(false); }
  };

  const isOwn = pub?.authorId === user?.id;
  const requesterIsDriver = pub ? !pub.driverToPassenger : false;

  const validate = () => {
    const e: Record<string,string> = {};
    if (!pickup.trim()) e.pickup = 'El punto de recojo es obligatorio';
    const s = parseInt(seats);
    if (isNaN(s) || s <= 0) e.seats = 'Debe ser al menos 1';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRequest = async () => {
    if (!validate() || !pub) return;
    if (requesterIsDriver && !hasVehicle) {
      Alert.alert('Vehículo requerido','Debes registrar un vehículo para solicitar como conductor.',[
        {text:'Cancelar',style:'cancel'},
        {text:'Ir a Vehículos',onPress:()=>navigation.navigate('Vehicle')},
      ]); return;
    }
    setSubmitting(true);
    try {
      await requestPublicationService.create(pub.id, {
        requesterIsDriver, seats: parseInt(seats), message: message.trim(),
        pickupPointOrDestine: pickup.trim(), externalLatitude: null, externalLongitude: null,
      });
      setSubmitted(true);
      Alert.alert('Solicitud enviada','Tu solicitud fue enviada. El conductor la revisará pronto.');
    } catch (e: any) {
      Alert.alert('Error al solicitar', parseAxiosError(e).message);
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingState message="Cargando viaje..." />;
  if (error) return <SafeAreaView style={s.safe}><ErrorMessage error={error} onRetry={load} /></SafeAreaView>;
  if (!pub) return null;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.dirBadge}>
          <Text style={s.dirTxt}>{pub.fromUTEC ? 'Saliendo de UTEC' : 'Hacia campus'}</Text>
          <Text style={s.kindTxt}>{pub.driverToPassenger ? '🚗 Ofrece asientos' : '🙋 Busca conductor'}</Text>
        </View>

        <Text style={s.titulo}>{pub.titulo}</Text>
        {pub.descripcion ? <Text style={s.desc}>{pub.descripcion}</Text> : null}

        <View style={s.infoCard}>
          <InfoRow icon="📍" label="Destino/Origen" value={pub.destinationOrOrigin} />
          <InfoRow icon="🕐" label="Salida" value={formatDateTime(pub.departureTime)} />
          <InfoRow icon="💺" label="Asientos" value={String(pub.seats)} />
          {pub.distanceToUtecKm != null && <InfoRow icon="📏" label="Distancia a UTEC" value={formatDistance(pub.distanceToUtecKm)} />}
          <InfoRow icon="🎓" label="Autor" value={"Estudiante UTEC #" + pub.authorId} />
          {weather && <InfoRow icon={weather.emoji} label="Clima en UTEC" value={weather.description + " " + weather.temperature + "°C"} />}
        </View>

        {!isOwn && !submitted && (
          <View style={s.formCard}>
            <Text style={s.formTitle}>
              {requesterIsDriver ? '🚗 Solicitar como conductor' : '🙋 Solicitar asiento'}
            </Text>
            {requesterIsDriver && !hasVehicle && (
              <View style={s.warning}>
                <Text style={s.warningTxt}>Necesitas registrar un vehículo para solicitar como conductor.</Text>
                <AppButton title="Ir a Vehículos" onPress={() => navigation.navigate('Vehicle')} variant="outline" style={{marginTop:8}} />
              </View>
            )}
            <AppInput label="Punto de recojo / destino" value={pickup} onChangeText={setPickup}
              placeholder="Ej: Óvalo Miraflores, altura BCP" error={formErrors.pickup} />
            <AppInput label="Asientos que necesitas" value={seats} onChangeText={setSeats}
              keyboardType="number-pad" placeholder="1" error={formErrors.seats} />
            <AppInput label="Mensaje (opcional)" value={message} onChangeText={setMessage}
              placeholder="Ej: Llego 5 min antes al punto" multiline />
            <AppButton title="Enviar solicitud" onPress={handleRequest} loading={submitting}
              disabled={requesterIsDriver && !hasVehicle} />
          </View>
        )}
        {submitted && <View style={s.successBox}><Text style={s.successTxt}>✅ Solicitud enviada. Asiento solicitado — Conductor por confirmar</Text></View>}
        {isOwn && <View style={s.ownNote}><Text style={s.ownNoteTxt}>Esta es tu publicación. Gestiona solicitudes en el Panel de conductor.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value }: any) => (
  <View style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#F2F4F7' }}>
    <Text style={{ color:'#8A9BB0', fontSize:13 }}>{icon} {label}</Text>
    <Text style={{ color:'#0B1F3A', fontSize:13, fontWeight:'600', flex:1, textAlign:'right' }}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  scroll:{padding:20,paddingBottom:40},
  dirBadge:{flexDirection:'row',justifyContent:'space-between',marginBottom:12},
  dirTxt:{color:'#18A8E0',fontWeight:'700',fontSize:13},
  kindTxt:{color:'#8A9BB0',fontSize:13},
  titulo:{fontSize:22,fontWeight:'800',color:'#0B1F3A',marginBottom:8},
  desc:{fontSize:14,color:'#4A5568',lineHeight:22,marginBottom:16},
  infoCard:{backgroundColor:'#fff',borderRadius:14,paddingHorizontal:16,marginBottom:20,shadowColor:'#0B1F3A',shadowOpacity:0.06,shadowRadius:6,elevation:2},
  formCard:{backgroundColor:'#fff',borderRadius:14,padding:16,marginBottom:20,shadowColor:'#0B1F3A',shadowOpacity:0.06,shadowRadius:6,elevation:2},
  formTitle:{fontSize:16,fontWeight:'700',color:'#0B1F3A',marginBottom:16},
  warning:{backgroundColor:'#FFF8DC',borderRadius:10,padding:12,marginBottom:12},
  warningTxt:{color:'#B7791F',fontSize:13,fontWeight:'600'},
  successBox:{backgroundColor:'#F0FFF4',borderRadius:12,padding:16,alignItems:'center'},
  successTxt:{color:'#276749',fontWeight:'700',fontSize:14,textAlign:'center'},
  ownNote:{backgroundColor:'#E8F7FD',borderRadius:10,padding:14},
  ownNoteTxt:{color:'#18A8E0',fontSize:13,fontWeight:'600',textAlign:'center'},
});