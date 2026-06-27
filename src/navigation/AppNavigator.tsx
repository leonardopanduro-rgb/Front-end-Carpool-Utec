import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { LoadingState } from '../components/LoadingState';

import { WelcomeScreen }     from '../screens/WelcomeScreen';
import { LoginScreen }       from '../screens/LoginScreen';
import { RegisterScreen }    from '../screens/RegisterScreen';
import { HomeScreen }        from '../screens/HomeScreen';
import { SearchTripsScreen } from '../screens/SearchTripsScreen';
import { TripDetailScreen }  from '../screens/TripDetailScreen';
import { PublishTripScreen } from '../screens/PublishTripScreen';
import { MyRequestsScreen }  from '../screens/MyRequestsScreen';
import { DriverPanelScreen } from '../screens/DriverPanelScreen';
import { VehicleScreen }     from '../screens/VehicleScreen';
import { ProfileScreen }     from '../screens/ProfileScreen';
import { ReviewScreen }      from '../screens/ReviewScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#0B1F3A' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: '#F2F4F7' },
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingState message="Restaurando sesión..." />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome"  component={WelcomeScreen}  options={{ headerShown: false }} />
            <Stack.Screen name="Login"    component={LoginScreen}    options={{ title: 'Iniciar sesión' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home"         component={HomeScreen}         options={{ title: 'Carpool UTEC', headerLeft: () => null }} />
            <Stack.Screen name="SearchTrips"  component={SearchTripsScreen}  options={{ title: 'Buscar viajes' }} />
            <Stack.Screen name="TripDetail"   component={TripDetailScreen}   options={{ title: 'Detalle del viaje' }} />
            <Stack.Screen name="PublishTrip"  component={PublishTripScreen}  options={{ title: 'Publicar viaje' }} />
            <Stack.Screen name="MyRequests"   component={MyRequestsScreen}   options={{ title: 'Mis solicitudes' }} />
            <Stack.Screen name="DriverPanel"  component={DriverPanelScreen}  options={{ title: 'Panel de solicitudes' }} />
            <Stack.Screen name="Vehicle"      component={VehicleScreen}      options={{ title: 'Mis vehículos' }} />
            <Stack.Screen name="Profile"      component={ProfileScreen}      options={{ title: 'Mi perfil' }} />
            <Stack.Screen name="Review"       component={ReviewScreen}       options={{ title: 'Calificar viaje' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};