import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { publicationService } from '../services/publication';
import { useVehicles } from '../hooks/useVehicles';
import { useAuth } from '../hooks/useAuth';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { DateTimePicker } from '../components/DateTimePicker';
import { toLocalIso } from '../utils/formatters';
import { getCurrentCoords } from '../utils/locationHelpers';
import { parseAxiosError } from '../utils/errorMessages';

export const PublishTripScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { vehicles, fetch: fetchVehicles } = useVehicles();
  const myVehicles = vehicles.filter(v => v.ownerId === user?.id);

  const [mode, setMode] = useState<'driver'|'passenger'>('driver'); // driverToPassenger=true | false
  const [fromUTEC, setFromUTEC] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [destination, setDestination] = useState('');
  const [seats, setSeats] = useState('');
  const [vehicleId, setVehicleId] = useState<number|null>(null);
  const [departure, setDeparture] = useState<Date|null>(null);
  const [useGPS, setUseGPS] = useState(false);
  const [coords, setCoords] = useState<{lat:number,lng:number}|null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  useEffect(() => { fetchVehicles(); }, []);

  const handleGPS = async () => {
    setLoadingGPS(true);
    const c = await getCurrentCoords();
    setLoadingGPS(false);
    if (c) { setCoords({lat:c.latitude,lng:c.longitude}); setUseGPS(true); Alert.alert('GPS','Coordenadas capturadas correctamente.'); }
    else Alert.alert('Sin acceso','No se pudo obtener la ubicación. Puedes continuar sin coordenadas.');
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!titulo.trim() || titulo.length > 120) e.titulo = 'Requerido (máx. 120 caracteres)';
    if (descripcion.length > 500) e.descripcion = 'Máximo 500 caracteres';
    if (!destination.trim() || destination.length > 120) e.destination = 'Requerido (máx. 120 caracteres)';
    const s = parseInt(seats);
    if (isNaN(s) || s <= 0) e.seats = 'Debe ser al menos 1';
    if (mode === 'driver') {
      if (!vehicleId) e.vehicle = 'Selecciona un vehículo';
      else {
        const v = myVehicles.find(v => v.id === vehicleId);
        if (v && s > v.seats) e.seats = `Máximo ${v.seats} para este vehículo`;
      }
    }
    if (!departure) e.datetime = 'Selecciona la fecha y hora de salida';
    else if (departure.getTime() < Date.now()) e.datetime = 'La salida debe ser en el futuro';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const dt = toLocalIso(departure!);
    try {
      await publicationService.create({
        fromUTEC, driverToPassenger: mode === 'driver',
        seats: parseInt(seats), titulo: titulo.trim(),
        descripcion: descripcion.trim(), destinationOrOrigin: destination.trim(),
        externalLatitude: useGPS && coords ? coords.lat : null,
        externalLongitude: useGPS && coords ? coords.lng : null,
        departureTime: dt,
        vehicleId: mode === 'driver' ? vehicleId : null,
      });
      Alert.alert('Publicación creada','Tu viaje fue publicado exitosamente.',[
        {text:'OK',onPress:()=>navigation.goBack()},
      ]);
    } catch (e: any) {
      Alert.alert('Error', parseAxiosError(e).message);
    } finally { setSubmitting(false); }
  };

  const ModeBtn = ({ m, label }: { m: 'driver'|'passenger', label: string }) => (
    <TouchableOpacity style={[styles.modeBtn, mode===m && styles.modeBtnActive]} onPress={() => setMode(m)}>
      <Text style={[styles.modeTxt, mode===m && styles.modeTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );
  const DirBtn = ({ val, label }: { val: boolean, label: string }) => (
    <TouchableOpacity style={[styles.modeBtn, fromUTEC===val && styles.modeBtnActive]} onPress={() => setFromUTEC(val)}>
      <Text style={[styles.modeTxt, fromUTEC===val && styles.modeTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Publicar viaje</Text>

        <Text style={styles.fieldLabel}>¿Qué ofreces?</Text>
        <View style={styles.modeRow}>
          <ModeBtn m="driver" label="🚗 Tengo auto y ofrezco asientos" />
          <ModeBtn m="passenger" label="🙋 Busco conductor" />
        </View>

        <Text style={styles.fieldLabel}>Sentido del viaje</Text>
        <View style={styles.modeRow}>
          <DirBtn val={true} label="Saliendo de UTEC" />
          <DirBtn val={false} label="Hacia campus" />
        </View>

        <AppInput label="Título (máx. 120)" value={titulo} onChangeText={setTitulo}
          placeholder="Ej: Viaje a Miraflores, salida 7am" error={errors.titulo} />
        <AppInput label="Descripción (opcional, máx. 500)" value={descripcion} onChangeText={setDescripcion}
          placeholder="Punto exacto de salida, referencias, etc." multiline error={errors.descripcion} />
        <AppInput label={fromUTEC ? 'Destino' : 'Origen'} value={destination} onChangeText={setDestination}
          placeholder="Ej: Miraflores, Av. Larco" error={errors.destination} />
        <AppInput label="Asientos disponibles" value={seats} onChangeText={setSeats}
          keyboardType="number-pad" placeholder="2" error={errors.seats} />

        <DateTimePicker label="Fecha y hora de salida" value={departure} onChange={setDeparture} error={errors.datetime} />

        {mode === 'driver' && (
          <>
            <Text style={styles.fieldLabel}>Vehículo</Text>
            {myVehicles.length === 0
              ? <AppButton title="Registrar vehículo primero" onPress={()=>navigation.navigate('Vehicle')} variant="outline" style={{marginBottom:12}} />
              : myVehicles.map(v => (
                <TouchableOpacity key={v.id} style={[styles.vehicleOpt, vehicleId===v.id && styles.vehicleOptActive]}
                  onPress={() => setVehicleId(v.id)}>
                  <Text style={styles.vehicleOptTxt}>{v.plate} — {v.brand} {v.model} ({v.seats} asientos)</Text>
                </TouchableOpacity>
              ))}
            {errors.vehicle ? <Text style={styles.err}>{errors.vehicle}</Text> : null}
          </>
        )}

        <View style={styles.gpsRow}>
          <AppButton title={loadingGPS ? 'Obteniendo GPS...' : coords ? '📍 Coordenadas capturadas' : '📍 Usar mi ubicación (opcional)'}
            onPress={handleGPS} variant="outline" loading={loadingGPS} style={{flex:1}} />
        </View>

        <AppButton title="Publicar viaje" onPress={handleSubmit} loading={submitting} style={{marginTop:8}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  scroll:{padding:20,paddingBottom:40},
  title:{fontSize:24,fontWeight:'800',color:'#0B1F3A',marginBottom:20},
  fieldLabel:{fontSize:13,fontWeight:'700',color:'#0B1F3A',marginBottom:8},
  modeRow:{flexDirection:'column',gap:8,marginBottom:20},
  modeBtn:{borderWidth:1.5,borderColor:'#D0D9E8',borderRadius:10,padding:14,backgroundColor:'#fff'},
  modeBtnActive:{borderColor:'#18A8E0',backgroundColor:'#E8F7FD'},
  modeTxt:{color:'#0B1F3A',fontSize:14,fontWeight:'600'},
  modeTxtActive:{color:'#18A8E0'},
  vehicleOpt:{borderWidth:1.5,borderColor:'#D0D9E8',borderRadius:10,padding:12,backgroundColor:'#fff',marginBottom:8},
  vehicleOptActive:{borderColor:'#18A8E0',backgroundColor:'#E8F7FD'},
  vehicleOptTxt:{color:'#0B1F3A',fontSize:13,fontWeight:'600'},
  gpsRow:{marginBottom:12},
  err:{color:'#E53E3E',fontSize:12,marginBottom:8},
});