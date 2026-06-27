import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { authService } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { CAREERS } from '../data/careers';
import { isUtecEmail, isValidPassword, isValidPhone, isValidStudentCode, isValidCycle, isValidCareer } from '../utils/validators';
import { parseAxiosError } from '../utils/errorMessages';

export const RegisterScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ name:'',lastName:'',email:'',password:'',confirm:'',phone:'',studentCode:'',career:'',cycle:'' });
  const [intent, setIntent] = useState<'passenger'|'driver'>('passenger');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [showCareer, setShowCareer] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({...f,[k]:v}));

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim()) e.name = 'Requerido';
    if (!form.lastName.trim()) e.lastName = 'Requerido';
    if (!isUtecEmail(form.email)) e.email = 'Debe ser @utec.edu.pe';
    if (!isValidPassword(form.password)) e.password = 'Mínimo 8 caracteres con letras y números';
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden';
    if (!isValidPhone(form.phone)) e.phone = 'Exactamente 9 dígitos';
    if (!isValidStudentCode(form.studentCode)) e.studentCode = 'Formato U + 9 dígitos (ej. U202600001)';
    if (!isValidCareer(form.career)) e.career = 'Selecciona una carrera';
    const cycleNum = parseInt(form.cycle);
    if (!isValidCycle(cycleNum)) e.cycle = 'Ciclo entre 1 y 12';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.register({
        name: form.name.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(), password: form.password,
        phone: form.phone.trim(), studentCode: form.studentCode.trim(),
        career: form.career, cycle: parseInt(form.cycle),
      });
      await login(res.accessToken, res.refreshToken, res.user);
      if (intent === 'driver') navigation.replace('Vehicle');
    } catch (err: any) {
      const e = parseAxiosError(err);
      Alert.alert('Error al registrarse', e.message);
    } finally { setLoading(false); }
  };

  const selectedCareer = CAREERS.find(c => c.value === form.career);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta UTEC</Text>
        <AppInput label="Nombre" value={form.name} onChangeText={v=>set('name',v)} placeholder="Juan" error={errors.name}/>
        <AppInput label="Apellido" value={form.lastName} onChangeText={v=>set('lastName',v)} placeholder="García" error={errors.lastName}/>
        <AppInput label="Correo UTEC" value={form.email} onChangeText={v=>set('email',v)} keyboardType="email-address" placeholder="tu.nombre@utec.edu.pe" error={errors.email}/>
        <AppInput label="Contraseña" value={form.password} onChangeText={v=>set('password',v)} isPassword placeholder="Mín. 8 caracteres con letras y números" error={errors.password}/>
        <AppInput label="Confirmar contraseña" value={form.confirm} onChangeText={v=>set('confirm',v)} isPassword placeholder="Repite tu contraseña" error={errors.confirm}/>
        <AppInput label="Teléfono" value={form.phone} onChangeText={v=>set('phone',v)} keyboardType="phone-pad" placeholder="987654321" error={errors.phone}/>
        <AppInput label="Código de estudiante" value={form.studentCode} onChangeText={v=>set('studentCode',v)} placeholder="U202600001" error={errors.studentCode}/>
        <AppInput label="Ciclo" value={form.cycle} onChangeText={v=>set('cycle',v)} keyboardType="number-pad" placeholder="1–12" error={errors.cycle}/>

        <Text style={styles.fieldLabel}>Carrera</Text>
        <TouchableOpacity style={[styles.select, errors.career && styles.selectErr]} onPress={() => setShowCareer(v=>!v)}>
          <Text style={selectedCareer ? styles.selectVal : styles.selectPlaceholder}>
            {selectedCareer ? selectedCareer.label : 'Selecciona tu carrera'}
          </Text>
        </TouchableOpacity>
        {showCareer && (
          <View style={styles.dropdown}>
            {CAREERS.map(c => (
              <TouchableOpacity key={c.value} style={styles.dropItem} onPress={() => { set('career', c.value); setShowCareer(false); }}>
                <Text style={[styles.dropTxt, form.career === c.value && styles.dropSelected]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {errors.career ? <Text style={styles.err}>{errors.career}</Text> : null}

        <Text style={styles.fieldLabel}>¿Cómo quieres empezar hoy?</Text>
        <View style={styles.intentRow}>
          {(['passenger','driver'] as const).map(opt => (
            <TouchableOpacity key={opt} style={[styles.intentBtn, intent===opt && styles.intentActive]} onPress={() => setIntent(opt)}>
              <Text style={[styles.intentTxt, intent===opt && styles.intentActiveTxt]}>
                {opt === 'passenger' ? '🙋 Buscar movilidad' : '🚗 Publicar como conductor'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppButton title="Crear cuenta" onPress={handleRegister} loading={loading} style={styles.btn}/>
        <AppButton title="Ya tengo cuenta" onPress={() => navigation.navigate('Login')} variant="outline" style={styles.link}/>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  scroll:{flexGrow:1,padding:24},
  title:{fontSize:24,fontWeight:'800',color:'#0B1F3A',marginBottom:20},
  fieldLabel:{fontSize:13,fontWeight:'600',color:'#0B1F3A',marginBottom:6},
  select:{borderWidth:1.5,borderColor:'#D0D9E8',borderRadius:10,backgroundColor:'#fff',height:48,justifyContent:'center',paddingHorizontal:14,marginBottom:4},
  selectErr:{borderColor:'#E53E3E'},
  selectVal:{color:'#0B1F3A',fontSize:15},
  selectPlaceholder:{color:'#8A9BB0',fontSize:15},
  dropdown:{backgroundColor:'#fff',borderRadius:10,borderWidth:1,borderColor:'#D0D9E8',marginBottom:8,maxHeight:200},
  dropItem:{paddingHorizontal:14,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#F2F4F7'},
  dropTxt:{color:'#0B1F3A',fontSize:14},
  dropSelected:{color:'#18A8E0',fontWeight:'700'},
  err:{color:'#E53E3E',fontSize:12,marginBottom:12},
  intentRow:{flexDirection:'column',gap:8,marginBottom:20},
  intentBtn:{borderWidth:1.5,borderColor:'#D0D9E8',borderRadius:10,padding:14,backgroundColor:'#fff'},
  intentActive:{borderColor:'#18A8E0',backgroundColor:'#E8F7FD'},
  intentTxt:{color:'#0B1F3A',fontSize:14,fontWeight:'600'},
  intentActiveTxt:{color:'#18A8E0'},
  btn:{marginTop:8},
  link:{marginTop:12},
});