import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import type { AppMode } from '../contexts/AuthContext';
import { useVehicles } from '../hooks/useVehicles';
import { AppButton } from '../components/AppButton';
import { VehicleCard } from '../components/VehicleCard';
import { LoadingState } from '../components/LoadingState';
import { formatRating } from '../utils/formatters';

const maskPhone = (phone?: string) => {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 3 ? `••• ••• ${digits.slice(-3)}` : phone;
};

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, refreshUser, mode, setMode } = useAuth();
  const { vehicles, loading, fetch } = useVehicles();
  const [loggingOut, setLoggingOut] = useState(false);

  useFocusEffect(useCallback(() => { refreshUser(); fetch(); }, [fetch]));

  const myVehicles = vehicles.filter(v => v.ownerId === user?.id);
  const hasVehicle = myVehicles.length > 0;

  const switchMode = (next: AppMode) => {
    if (next === mode) return;
    if (next === 'driver' && !hasVehicle) {
      Alert.alert('Registra un vehículo', 'Para usar el modo conductor primero debes registrar un vehículo.', [
        { text: 'Ahora no', style: 'cancel' },
        { text: 'Registrar', onPress: () => navigation.navigate('Vehicle') },
      ]);
      return;
    }
    setMode(next);
  };

  const editPhone = () => Alert.alert('Editar teléfono', 'La edición de tus datos estará disponible próximamente.');

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => { setLoggingOut(true); await logout(); } },
    ]);
  };

  if (!user) return <LoadingState />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>{user.name[0]}{user.lastName[0]}</Text></View>
          <Text style={styles.name}>{user.name} {user.lastName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.verifiedChip}><Text style={styles.verifiedTxt}>✓ Cuenta UTEC verificada</Text></View>
          <Text style={styles.rating}>{formatRating(user.rating)}</Text>
        </View>

        <View style={styles.card}>
          <Row label="Código" value={user.studentCode} />
          <Row label="Carrera" value={user.career.replace(/_/g,' ')} />
          <Row label="Ciclo" value={String(user.cycle)} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Teléfono</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{maskPhone(user.phone)}</Text>
              <TouchableOpacity onPress={editPhone}><Text style={styles.editLink}>Editar</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Rol</Text>
        <Text style={styles.modeAvailable}>
          Modo disponible: {hasVehicle ? 'pasajero y conductor' : 'pasajero'}
        </Text>
        <View style={styles.modeSwitch}>
          <TouchableOpacity style={[styles.modeOpt, mode === 'passenger' && styles.modeOptActive]}
            onPress={() => switchMode('passenger')} activeOpacity={0.8}>
            <Text style={[styles.modeOptTxt, mode === 'passenger' && styles.modeOptTxtActive]}>🙋 Pasajero</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeOpt, mode === 'driver' && styles.modeOptActive, !hasVehicle && styles.modeOptLocked]}
            onPress={() => switchMode('driver')} activeOpacity={0.8}>
            <Text style={[styles.modeOptTxt, mode === 'driver' && styles.modeOptTxtActive, !hasVehicle && styles.modeOptTxtLocked]}>
              {hasVehicle ? '🚗 Conductor' : '🔒 Conductor'}
            </Text>
          </TouchableOpacity>
        </View>
        {!hasVehicle && (
          <View style={styles.lockHint}>
            <Text style={styles.lockHintTxt}>Para ofrecer viajes como conductor, primero registra tu vehículo.</Text>
            <AppButton title="Activar modo conductor" onPress={() => navigation.navigate('Vehicle')} variant="outline" style={{ marginTop: 10 }} />
          </View>
        )}

        <Text style={styles.sectionTitle}>Mis vehículos</Text>
        <Text style={styles.modeAvailable}>
          {hasVehicle ? `${myVehicles.length} vehículo(s) registrado(s)` : 'Sin vehículo registrado'}
        </Text>
        {loading ? <LoadingState message="Cargando vehículos..." /> : myVehicles.length === 0
          ? <AppButton title="Registrar vehículo" onPress={() => navigation.navigate('Vehicle')} variant="outline" />
          : myVehicles.map((v, i) => <VehicleCard key={v.id} vehicle={v} tags={i === 0 ? ['Principal'] : undefined} onEdit={() => navigation.navigate('Vehicle')} />)}

        <AppButton title="Cerrar sesión" onPress={handleLogout} variant="danger" loading={loggingOut} style={styles.logoutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#F2F4F7' }}>
    <Text style={{ color:'#8A9BB0', fontSize:13 }}>{label}</Text>
    <Text style={{ color:'#0B1F3A', fontSize:13, fontWeight:'600' }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  scroll:{padding:20,paddingBottom:40},
  avatarWrap:{alignItems:'center',marginBottom:24},
  avatar:{width:80,height:80,borderRadius:40,backgroundColor:'#0B1F3A',alignItems:'center',justifyContent:'center',marginBottom:12},
  avatarTxt:{color:'#18A8E0',fontSize:28,fontWeight:'800'},
  name:{fontSize:20,fontWeight:'800',color:'#0B1F3A'},
  email:{color:'#8A9BB0',fontSize:13,marginTop:4},
  rating:{fontSize:16,marginTop:8},
  card:{backgroundColor:'#fff',borderRadius:14,paddingHorizontal:16,marginBottom:16,shadowColor:'#0B1F3A',shadowOpacity:0.06,shadowRadius:6,elevation:2},
  modeSwitch:{flexDirection:'row',backgroundColor:'#E4EAF2',borderRadius:12,padding:4,marginBottom:20},
  modeOpt:{flex:1,paddingVertical:10,borderRadius:9,alignItems:'center'},
  modeOptActive:{backgroundColor:'#fff',shadowColor:'#0B1F3A',shadowOpacity:0.08,shadowRadius:4,elevation:2},
  modeOptTxt:{fontSize:14,fontWeight:'700',color:'#8A9BB0'},
  modeOptTxtActive:{color:'#0B1F3A'},
  modeOptLocked:{opacity:0.6},
  modeOptTxtLocked:{color:'#A0AAB8'},
  modeAvailable:{fontSize:13,color:'#4A5568',marginBottom:10},
  verifiedChip:{backgroundColor:'#E8F7EF',borderRadius:20,paddingHorizontal:12,paddingVertical:4,marginTop:8},
  verifiedTxt:{color:'#1B8A5A',fontSize:12,fontWeight:'700'},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#F2F4F7'},
  rowLabel:{color:'#8A9BB0',fontSize:13},
  rowRight:{flexDirection:'row',alignItems:'center',gap:10},
  rowValue:{color:'#0B1F3A',fontSize:13,fontWeight:'600'},
  editLink:{color:'#18A8E0',fontSize:13,fontWeight:'700'},
  lockHint:{backgroundColor:'#FFF8DC',borderRadius:10,padding:12,marginBottom:20,marginTop:-8},
  lockHintTxt:{color:'#B7791F',fontSize:13,fontWeight:'600'},
  sectionTitle:{fontSize:16,fontWeight:'700',color:'#0B1F3A',marginBottom:12},
  logoutBtn:{marginTop:24},
});