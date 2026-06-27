import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { usePublications } from '../hooks/usePublications';
import { useRequests } from '../hooks/useRequests';
import { useRides } from '../hooks/useRides';
import { LoadingState } from '../components/LoadingState';
import { TripCard } from '../components/TripCard';
import { SectionHeader } from '../components/SectionHeader';
import { AppButton } from '../components/AppButton';
import { formatDateTime, isPast } from '../utils/formatters';

const QuickAction = ({ emoji, label, onPress }: any) => (
  <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.actionEmoji}>{emoji}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { publications, loading: loadingPubs, fetch: fetchPubs } = usePublications();
  const { requests, loading: loadingReqs, fetch: fetchReqs } = useRequests();
  const { myRides, loading: loadingRides, fetch: fetchRides } = useRides(user?.id ?? null);

  useEffect(() => { fetchPubs(); fetchReqs(); fetchRides(); }, []);

  const available = publications.filter(p => p.authorId !== user?.id);
  const myPending = requests.filter(r => r.requesterId === user?.id && r.status === 'PENDING');

  if (loadingPubs && loadingReqs && loadingRides) return <LoadingState message="Cargando tu panel..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.name} 👋</Text>
            <Text style={styles.sub}>{user?.career?.replace(/_/g,' ')}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingTxt}>⭐ {user?.rating?.toFixed(1) ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { n: available.length, label: 'Disponibles' },
            { n: myPending.length, label: 'Pendientes' },
            { n: myRides.length, label: 'Confirmados' },
          ].map(s => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statN}>{s.n}</Text>
              <Text style={styles.statL}>{s.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Acciones rápidas" />
        <View style={styles.actionsGrid}>
          <QuickAction emoji="🔍" label="Buscar viaje"     onPress={() => navigation.navigate('SearchTrips')} />
          <QuickAction emoji="🚗" label="Publicar viaje"   onPress={() => navigation.navigate('PublishTrip')} />
          <QuickAction emoji="📋" label="Mis solicitudes"  onPress={() => navigation.navigate('MyRequests')} />
          <QuickAction emoji="📬" label="Panel conductor"  onPress={() => navigation.navigate('DriverPanel')} />
          <QuickAction emoji="🚙" label="Mis vehículos"    onPress={() => navigation.navigate('Vehicle')} />
          <QuickAction emoji="👤" label="Perfil"           onPress={() => navigation.navigate('Profile')} />
        </View>

        {myRides.length > 0 && (
          <>
            <SectionHeader title="Viajes confirmados" />
            {myRides.map(({ ride, role }) => {
              const past = isPast(ride.departureTime);
              return (
                <View key={ride.id} style={styles.rideCard}>
                  <View style={styles.rideTop}>
                    <View style={styles.rideBadge}>
                      <Text style={styles.rideBadgeTxt}>
                        {role === 'driver' ? '🚗 Conductor' : '🙋 Pasajero'}
                      </Text>
                    </View>
                    {past && (
                      <TouchableOpacity
                        style={styles.rateBtn}
                        onPress={() => navigation.navigate('Review', { rideId: ride.id })}
                      >
                        <Text style={styles.rateBtnTxt}>⭐ Calificar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.rideDest}>📍 {ride.destinationOrOrigin}</Text>
                  <Text style={styles.rideTime}>🕐 {formatDateTime(ride.departureTime)}</Text>
                  {!past && <Text style={styles.rideStatus}>Viaje próximo · Conductor por confirmar</Text>}
                </View>
              );
            })}
          </>
        )}

        {available.length > 0 && (
          <>
            <SectionHeader title="Viajes disponibles" action="Ver todos"
              onAction={() => navigation.navigate('SearchTrips')} />
            {available.slice(0, 3).map(p => (
              <TripCard key={p.id} pub={p}
                onPress={() => navigation.navigate('TripDetail', { publicationId: p.id })} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  scroll:{padding:20,paddingBottom:40},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},
  greeting:{fontSize:22,fontWeight:'800',color:'#0B1F3A'},
  sub:{fontSize:13,color:'#8A9BB0',marginTop:2},
  ratingBadge:{backgroundColor:'#0B1F3A',borderRadius:20,paddingHorizontal:12,paddingVertical:6},
  ratingTxt:{color:'#fff',fontWeight:'700',fontSize:13},
  statsRow:{flexDirection:'row',gap:8,marginBottom:24},
  stat:{flex:1,backgroundColor:'#fff',borderRadius:12,padding:12,alignItems:'center',shadowColor:'#0B1F3A',shadowOpacity:0.06,shadowRadius:6,elevation:2},
  statN:{fontSize:22,fontWeight:'800',color:'#18A8E0'},
  statL:{fontSize:11,color:'#8A9BB0',textAlign:'center',marginTop:2},
  actionsGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:24},
  action:{width:'30%',backgroundColor:'#fff',borderRadius:12,padding:14,alignItems:'center',shadowColor:'#0B1F3A',shadowOpacity:0.06,shadowRadius:6,elevation:2},
  actionEmoji:{fontSize:24,marginBottom:6},
  actionLabel:{fontSize:11,color:'#0B1F3A',fontWeight:'600',textAlign:'center'},
  rideCard:{backgroundColor:'#fff',borderRadius:14,padding:14,marginBottom:10,borderLeftWidth:4,borderLeftColor:'#18A8E0'},
  rideTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:6},
  rideBadge:{backgroundColor:'#E8F7FD',borderRadius:20,paddingHorizontal:10,paddingVertical:3},
  rideBadgeTxt:{color:'#18A8E0',fontSize:12,fontWeight:'700'},
  rateBtn:{backgroundColor:'#0B1F3A',borderRadius:20,paddingHorizontal:10,paddingVertical:4},
  rateBtnTxt:{color:'#F5C518',fontSize:12,fontWeight:'700'},
  rideDest:{fontSize:14,color:'#0B1F3A',fontWeight:'600',marginBottom:4},
  rideTime:{fontSize:12,color:'#8A9BB0',marginBottom:4},
  rideStatus:{fontSize:11,color:'#18A8E0',fontWeight:'600'},
});