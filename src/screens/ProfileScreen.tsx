import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useVehicles } from '../hooks/useVehicles';
import { AppButton } from '../components/AppButton';
import { VehicleCard } from '../components/VehicleCard';
import { LoadingState } from '../components/LoadingState';
import { formatRating } from '../utils/formatters';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, refreshUser } = useAuth();
  const { vehicles, loading, fetch } = useVehicles();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => { refreshUser(); fetch(); }, []);

  const myVehicles = vehicles.filter(v => v.ownerId === user?.id);

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
          <Text style={styles.rating}>{formatRating(user.rating)}</Text>
        </View>

        <View style={styles.card}>
          <Row label="Código" value={user.studentCode} />
          <Row label="Carrera" value={user.career.replace(/_/g,' ')} />
          <Row label="Ciclo" value={String(user.cycle)} />
          <Row label="Teléfono" value={user.phone} />
          <Row label="Rol" value={user.role} />
        </View>

        <Text style={styles.flexNote}>Modo de uso flexible: puedes ser pasajero o conductor según el viaje</Text>

        <Text style={styles.sectionTitle}>Mis vehículos</Text>
        {loading ? <LoadingState message="Cargando vehículos..." /> : myVehicles.length === 0
          ? <AppButton title="Registrar vehículo" onPress={() => navigation.navigate('Vehicle')} variant="outline" />
          : myVehicles.map(v => <VehicleCard key={v.id} vehicle={v} onEdit={() => navigation.navigate('Vehicle')} />)}

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
  flexNote:{backgroundColor:'#E8F7FD',borderRadius:10,padding:14,fontSize:13,color:'#18A8E0',fontWeight:'600',marginBottom:20,textAlign:'center'},
  sectionTitle:{fontSize:16,fontWeight:'700',color:'#0B1F3A',marginBottom:12},
  logoutBtn:{marginTop:24},
});