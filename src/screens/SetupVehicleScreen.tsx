import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AppButton } from '../components/AppButton';
import { useAuth } from '../hooks/useAuth';
import { useVehicles } from '../hooks/useVehicles';

/**
 * Pantalla que se muestra una sola vez, justo después de registrarse.
 * Permite registrar un vehículo (para activar modo conductor) u omitir
 * y entrar como pasajero. Vive en un mini-stack [SetupVehicle, Vehicle];
 * al terminar baja `pendingVehicleSetup` y el navigator entra a la app.
 */
export const SetupVehicleScreen = ({ navigation }: any) => {
  const { user, setMode, setPendingVehicleSetup } = useAuth();
  const { vehicles, fetch } = useVehicles();
  const hasVehicle = vehicles.some((v) => v.ownerId === user?.id);

  // Al volver de registrar el vehículo, refrescamos para detectarlo.
  useFocusEffect(useCallback(() => { fetch(); }, [fetch]));

  const finish = async (mode: 'driver' | 'passenger') => {
    await setMode(mode);
    setPendingVehicleSetup(false); // el navigator cambia al stack principal (Home)
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>¡Bienvenido, {user?.name}!</Text>
        <Text style={styles.sub}>
          ¿Vas a ofrecer viajes como conductor? Registra tu vehículo para activar el modo
          conductor. Si solo buscas movilidad, puedes omitir este paso y entrar como pasajero.
        </Text>

        {hasVehicle ? (
          <View style={styles.okBox}>
            <Text style={styles.okTxt}>✅ Vehículo registrado</Text>
          </View>
        ) : null}

        <View style={styles.btns}>
          {hasVehicle ? (
            <AppButton title="Entrar como conductor" onPress={() => finish('driver')} />
          ) : (
            <AppButton title="Registrar mi vehículo" onPress={() => navigation.navigate('Vehicle')} />
          )}
          <AppButton
            title={hasVehicle ? 'Entrar como pasajero' : 'Continuar como pasajero'}
            onPress={() => finish('passenger')}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F7' },
  content: { flex: 1, justifyContent: 'center', padding: 28, maxWidth: 440, width: '100%', alignSelf: 'center' },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#0B1F3A', textAlign: 'center', marginBottom: 12 },
  sub: { fontSize: 15, color: '#4A5568', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  okBox: { backgroundColor: '#E8F7EF', borderRadius: 10, padding: 12, marginBottom: 16 },
  okTxt: { color: '#1B8A5A', fontWeight: '700', textAlign: 'center' },
  btns: { marginTop: 8 },
});
