import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rideService } from '../services/ride';
import { ridePassengerService } from '../services/ridePassenger';
import { reviewService } from '../services/review';
import { useAuth } from '../hooks/useAuth';
import { Ride } from '../types/ride';
import { RidePassenger } from '../types/ridePassenger';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { AppError } from '../types/apiError';
import { isPast, formatDateTime } from '../utils/formatters';
import { parseAxiosError } from '../utils/errorMessages';

const TAGS = ['Puntualidad', 'Respeto', 'Comunicación', 'Seguridad'];

export const ReviewScreen = ({ route, navigation }: any) => {
  const { rideId } = route.params;
  const { user } = useAuth();
  const [ride, setRide] = useState<Ride|null>(null);
  const [passengers, setPassengers] = useState<RidePassenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError|null>(null);
  const [reviewedId, setReviewedId] = useState<number|null>(null);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingReviews, setExistingReviews] = useState<number[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [r, allPass, allReviews] = await Promise.all([
        rideService.getById(rideId),
        ridePassengerService.getAll(),
        reviewService.getAll(),
      ]);
      setRide(r);
      setPassengers(allPass.filter(p => p.rideId === rideId));
      const myReviewedIds = allReviews.filter(rv => rv.reviewerId === user?.id && rv.rideId === rideId).map(rv => rv.reviewedId);
      setExistingReviews(myReviewedIds);
    } catch(e){ setError(e as AppError); }
    finally{ setLoading(false); }
  };

  if (loading) return <LoadingState />;
  if (error) return <SafeAreaView style={s.safe}><ErrorMessage error={error} onRetry={load} /></SafeAreaView>;
  if (!ride) return null;

  if (!isPast(ride.departureTime)) {
    return <SafeAreaView style={s.safe}><View style={s.center}>
      <Text style={s.notYet}>El viaje aún no ha ocurrido.</Text>
      <Text style={s.notYetSub}>Podrás calificar después del {formatDateTime(ride.departureTime)}</Text>
    </View></SafeAreaView>;
  }

  const participants: number[] = [];
  if (ride.driverId !== user?.id) participants.push(ride.driverId);
  passengers.forEach(p => { if (p.passengerId !== user?.id) participants.push(p.passengerId); });
  const notReviewed = participants.filter(id => !existingReviews.includes(id));

  const toggleTag = (t: string) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = async () => {
    if (!reviewedId) { Alert.alert('Selecciona','Elige a quién calificar'); return; }
    if (rating === 0) { Alert.alert('Elige estrellas','Selecciona una calificación de 1 a 5'); return; }
    const finalComment = [comment.trim(), tags.length ? `Destacó: ${tags.join(', ')}` : '']
      .filter(Boolean).join(' · ');
    if (finalComment.length > 500) { Alert.alert('Comentario muy largo','Máximo 500 caracteres'); return; }
    setSubmitting(true);
    try {
      await reviewService.create({ rideId, reviewedId, rating, comment: finalComment });
      setSubmitted(true);
      setExistingReviews(prev => [...prev, reviewedId]);
      setReviewedId(null); setComment(''); setRating(0); setTags([]);
      Alert.alert('Gracias por calificar', 'Tu opinión ayuda a mantener segura la comunidad UTEC.');
    } catch(e:any){ Alert.alert('Error',parseAxiosError(e).message); }
    finally{ setSubmitting(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Calificar participantes</Text>
        <Text style={s.sub}>Viaje del {formatDateTime(ride.departureTime)}</Text>
        <Text style={s.sub}>📍 {ride.destinationOrOrigin}</Text>

        {notReviewed.length === 0
          ? <View style={s.done}><Text style={s.doneTxt}>✅ Ya calificaste a todos los participantes</Text></View>
          : <>
            <Text style={s.label}>¿A quién quieres calificar?</Text>
            {notReviewed.map(id => (
              <TouchableOpacity key={id} style={[s.participantBtn, reviewedId===id && s.participantBtnActive]}
                onPress={() => setReviewedId(id)}>
                <Text style={[s.participantTxt, reviewedId===id && s.participantTxtActive]}>
                  {id === ride.driverId ? '🚗 Conductor' : '🙋 Pasajero'} — Estudiante UTEC #{id}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={s.label}>Calificación</Text>
            <View style={s.starsRow}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Text style={[s.star, n<=rating && s.starActive]}>{n<=rating?'★':'☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>¿Qué destacó? (opcional)</Text>
            <View style={s.tagsRow}>
              {TAGS.map(t => {
                const active = tags.includes(t);
                return (
                  <TouchableOpacity key={t} style={[s.tag, active && s.tagActive]} onPress={() => toggleTag(t)}>
                    <Text style={[s.tagTxt, active && s.tagTxtActive]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppInput label="Comentario (opcional)" value={comment} onChangeText={setComment}
              placeholder="¿Cómo fue la experiencia?" multiline />
            <Text style={s.counter}>{comment.length}/500</Text>
            <AppButton title="Enviar calificación" onPress={handleSubmit} loading={submitting}
              disabled={!reviewedId || rating === 0} />
          </>}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  scroll:{padding:20,paddingBottom:40},
  center:{flex:1,alignItems:'center',justifyContent:'center',padding:32},
  title:{fontSize:22,fontWeight:'800',color:'#0B1F3A',marginBottom:4},
  sub:{fontSize:13,color:'#8A9BB0',marginBottom:2},
  label:{fontSize:13,fontWeight:'700',color:'#0B1F3A',marginTop:20,marginBottom:10},
  participantBtn:{borderWidth:1.5,borderColor:'#D0D9E8',borderRadius:10,padding:14,marginBottom:8,backgroundColor:'#fff'},
  participantBtnActive:{borderColor:'#18A8E0',backgroundColor:'#E8F7FD'},
  participantTxt:{color:'#0B1F3A',fontWeight:'600',fontSize:14},
  participantTxtActive:{color:'#18A8E0'},
  starsRow:{flexDirection:'row',gap:8,marginBottom:8},
  star:{fontSize:36,color:'#D0D9E8'},
  starActive:{color:'#F5C518'},
  tagsRow:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:8},
  tag:{borderRadius:20,borderWidth:1.5,borderColor:'#D0D9E8',paddingHorizontal:12,paddingVertical:6,backgroundColor:'#fff'},
  tagActive:{borderColor:'#18A8E0',backgroundColor:'#E8F7FD'},
  tagTxt:{color:'#0B1F3A',fontSize:12,fontWeight:'600'},
  tagTxtActive:{color:'#18A8E0'},
  counter:{color:'#8A9BB0',fontSize:12,textAlign:'right',marginBottom:12,marginTop:-6},
  done:{backgroundColor:'#F0FFF4',borderRadius:12,padding:20,alignItems:'center'},
  doneTxt:{color:'#276749',fontWeight:'700',fontSize:15},
  notYet:{fontSize:18,fontWeight:'700',color:'#0B1F3A',textAlign:'center',marginBottom:8},
  notYetSub:{color:'#8A9BB0',fontSize:14,textAlign:'center'},
});