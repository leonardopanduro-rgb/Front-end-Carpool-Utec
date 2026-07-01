import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
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
import { isValidPricePerSeat } from '../utils/validators';

export const PublishTripScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { vehicles, fetch: fetchVehicles } = useVehicles();
  const myVehicles = vehicles.filter(v => v.ownerId === user?.id);

  const [fromUTEC, setFromUTEC] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [destination, setDestination] = useState('');
  const [seats, setSeats] = useState('');
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [departure, setDeparture] = useState<Date | null>(null);
  const [useGPS, setUseGPS] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleGPS = async () => {
    setLoadingGPS(true);
    const c = await getCurrentCoords();
    setLoadingGPS(false);
    if (c) {
      setCoords({ lat: c.latitude, lng: c.longitude });
      setUseGPS(true);
      Alert.alert('GPS', 'Coordenadas capturadas correctamente.');
    } else {
      Alert.alert('Sin acceso', 'No se pudo obtener la ubicacion. Puedes continuar sin coordenadas.');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const parsedSeats = Number(seats);
    const parsedPrice = Number(pricePerSeat);

    if (!titulo.trim() || titulo.length > 120) e.titulo = 'Requerido (max. 120 caracteres)';
    if (descripcion.length > 500) e.descripcion = 'Maximo 500 caracteres';
    if (!destination.trim() || destination.length > 120) e.destination = 'Requerido (max. 120 caracteres)';
    if (!Number.isInteger(parsedSeats) || parsedSeats <= 0) e.seats = 'Debe ser al menos 1';
    if (!pricePerSeat.trim()) e.pricePerSeat = 'Ingresa el precio por asiento';
    else if (!isValidPricePerSeat(parsedPrice)) e.pricePerSeat = 'El precio por asiento debe ser mayor que 0';

    if (!vehicleId) e.vehicle = 'Selecciona un vehiculo';
    else {
      const v = myVehicles.find(item => item.id === vehicleId);
      if (v && parsedSeats > v.seats) e.seats = `Maximo ${v.seats} para este vehiculo`;
    }

    if (!departure) e.datetime = 'Selecciona la fecha y hora de salida';
    else if (departure.getTime() < Date.now()) e.datetime = 'La salida debe ser en el futuro';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !vehicleId) return;
    setSubmitting(true);
    try {
      await publicationService.create({
        fromUTEC,
        driverToPassenger: true,
        seats: Number(seats),
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        destinationOrOrigin: destination.trim(),
        externalLatitude: useGPS && coords ? coords.lat : null,
        externalLongitude: useGPS && coords ? coords.lng : null,
        departureTime: toLocalIso(departure!),
        pricePerSeat: Number(pricePerSeat),
        vehicleId,
      });
      Alert.alert('Publicacion creada', 'Tu viaje fue publicado exitosamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', parseAxiosError(e).message);
    } finally {
      setSubmitting(false);
    }
  };

  const DirBtn = ({ val, label }: { val: boolean; label: string }) => (
    <TouchableOpacity style={[styles.modeBtn, fromUTEC === val && styles.modeBtnActive]} onPress={() => setFromUTEC(val)}>
      <Text style={[styles.modeTxt, fromUTEC === val && styles.modeTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Publicar viaje</Text>

        {myVehicles.length === 0 && (
          <View style={styles.blockBanner}>
            <Text style={styles.blockTxt}>Necesitas registrar un vehiculo para publicar viajes.</Text>
            <AppButton title="Registrar vehiculo" onPress={() => navigation.navigate('Vehicle')} variant="outline" style={{ marginTop: 10 }} />
          </View>
        )}

        <Text style={styles.fieldLabel}>Sentido del viaje</Text>
        <View style={styles.modeRow}>
          <DirBtn val={true} label="Saliendo de UTEC" />
          <DirBtn val={false} label="Hacia campus" />
        </View>

        <AppInput label="Titulo (max. 120)" value={titulo} onChangeText={setTitulo}
          placeholder="Ej: Viaje a Miraflores, salida 7am" error={errors.titulo} />
        <AppInput label="Descripcion (opcional, max. 500)" value={descripcion} onChangeText={setDescripcion}
          placeholder="Punto exacto de salida, referencias, etc." multiline error={errors.descripcion} />
        <AppInput label={fromUTEC ? 'Destino' : 'Origen'} value={destination} onChangeText={setDestination}
          placeholder="Ej: Miraflores, Av. Larco" error={errors.destination} />
        <AppInput label="Cupos disponibles" value={seats} onChangeText={setSeats}
          keyboardType="number-pad" placeholder="4" error={errors.seats} />
        <AppInput label="Precio por asiento (S/)" value={pricePerSeat} onChangeText={setPricePerSeat}
          keyboardType="decimal-pad" placeholder="7.00" error={errors.pricePerSeat} />

        <DateTimePicker label="Fecha y hora de salida" value={departure} onChange={setDeparture} error={errors.datetime} />

        <Text style={styles.fieldLabel}>Vehiculo</Text>
        {myVehicles.length === 0
          ? <AppButton title="Registrar vehiculo primero" onPress={() => navigation.navigate('Vehicle')} variant="outline" style={{ marginBottom: 12 }} />
          : myVehicles.map(v => (
            <TouchableOpacity key={v.id} style={[styles.vehicleOpt, vehicleId === v.id && styles.vehicleOptActive]}
              onPress={() => setVehicleId(v.id)}>
              <Text style={styles.vehicleOptTxt}>{v.plate} - {v.brand} {v.model} ({v.seats} asientos)</Text>
            </TouchableOpacity>
          ))}
        {errors.vehicle ? <Text style={styles.err}>{errors.vehicle}</Text> : null}

        <View style={styles.gpsRow}>
          <AppButton title={loadingGPS ? 'Obteniendo GPS...' : coords ? 'Coordenadas capturadas' : 'Usar mi ubicacion (opcional)'}
            onPress={handleGPS} variant="outline" loading={loadingGPS} style={{ flex: 1 }} />
        </View>

        <AppButton title="Publicar viaje" onPress={handleSubmit} loading={submitting} disabled={myVehicles.length === 0} style={{ marginTop: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F7' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#0B1F3A', marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#0B1F3A', marginBottom: 8 },
  modeRow: { flexDirection: 'column', gap: 8, marginBottom: 20 },
  modeBtn: { borderWidth: 1.5, borderColor: '#D0D9E8', borderRadius: 10, padding: 14, backgroundColor: '#fff' },
  modeBtnActive: { borderColor: '#18A8E0', backgroundColor: '#E8F7FD' },
  modeTxt: { color: '#0B1F3A', fontSize: 14, fontWeight: '600' },
  modeTxtActive: { color: '#18A8E0' },
  vehicleOpt: { borderWidth: 1.5, borderColor: '#D0D9E8', borderRadius: 10, padding: 12, backgroundColor: '#fff', marginBottom: 8 },
  vehicleOptActive: { borderColor: '#18A8E0', backgroundColor: '#E8F7FD' },
  vehicleOptTxt: { color: '#0B1F3A', fontSize: 13, fontWeight: '600' },
  gpsRow: { marginBottom: 12 },
  err: { color: '#E53E3E', fontSize: 12, marginBottom: 8 },
  blockBanner: { backgroundColor: '#FFF8DC', borderRadius: 12, padding: 14, marginBottom: 16 },
  blockTxt: { color: '#B7791F', fontSize: 14, fontWeight: '700' },
});
