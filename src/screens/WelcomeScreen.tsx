import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';

export const WelcomeScreen = ({ navigation }: any) => (
  <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="light-content" backgroundColor="#0B1F3A" />
    <View style={styles.hero}>
      <Text style={styles.logo}>🚗</Text>
      <Text style={styles.title}>Carpool UTEC</Text>
      <Text style={styles.sub}>Viajes compartidos entre{"\n"}estudiantes UTEC</Text>
    </View>
    <View style={styles.routes}>
      {['Barranco → Campus','Miraflores → UTEC','Surco → Campus'].map(r => (
        <View key={r} style={styles.routeChip}><Text style={styles.routeTxt}>{r}</Text></View>
      ))}
    </View>
    <Text style={styles.tagline}>Desde Barranco, Miraflores, Surco, San Isidro y más</Text>
    <View style={styles.btns}>
      <AppButton title="Iniciar sesión" onPress={() => navigation.navigate('Login')} />
      <AppButton title="Crear cuenta" onPress={() => navigation.navigate('Register')} variant="outline" style={{marginTop:12}} />
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#0B1F3A',paddingHorizontal:28,paddingVertical:20},
  hero:{flex:1,alignItems:'center',justifyContent:'center'},
  logo:{fontSize:64,marginBottom:16},
  title:{fontSize:34,fontWeight:'800',color:'#fff',letterSpacing:0.5},
  sub:{fontSize:16,color:'#8FC8E8',textAlign:'center',marginTop:8,lineHeight:24},
  routes:{flexDirection:'row',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:16},
  routeChip:{backgroundColor:'rgba(24,168,224,0.15)',borderRadius:20,paddingHorizontal:12,paddingVertical:6,borderWidth:1,borderColor:'rgba(24,168,224,0.3)'},
  routeTxt:{color:'#18A8E0',fontSize:12,fontWeight:'600'},
  tagline:{color:'#8A9BB0',fontSize:13,textAlign:'center',marginBottom:32},
  btns:{gap:0},
});
