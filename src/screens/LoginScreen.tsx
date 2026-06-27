import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { authService } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { isUtecEmail } from '../utils/validators';
import { parseAxiosError } from '../utils/errorMessages';

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!isUtecEmail(email)) e.email = 'Debe ser un correo @utec.edu.pe';
    if (!password) e.password = 'Ingresa tu contraseña';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.login({ email: email.trim(), password });
      await login(res.accessToken, res.refreshToken, res.user);
    } catch (err: any) {
      const appErr = parseAxiosError(err);
      Alert.alert('Error al ingresar', appErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Bienvenido de vuelta</Text>
        <Text style={styles.sub}>Accede con tu correo institucional UTEC</Text>
        <AppInput label="Correo UTEC" value={email} onChangeText={setEmail}
          keyboardType="email-address" placeholder="tu.nombre@utec.edu.pe" error={errors.email} />
        <AppInput label="Contraseña" value={password} onChangeText={setPassword}
          isPassword placeholder="••••••••" error={errors.password} />
        <AppButton title="Iniciar sesión" onPress={handleLogin} loading={loading} style={styles.btn} />
        <AppButton title="¿No tienes cuenta? Regístrate" onPress={() => navigation.navigate('Register')}
          variant="outline" style={styles.link} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  scroll:{flexGrow:1,padding:24,justifyContent:'center'},
  title:{fontSize:26,fontWeight:'800',color:'#0B1F3A',marginBottom:6},
  sub:{fontSize:14,color:'#8A9BB0',marginBottom:28},
  btn:{marginTop:8},
  link:{marginTop:12},
});