# Carpool UTEC — Frontend Mobile

App universitaria para estudiantes UTEC: publicar viajes, solicitar asientos, gestionar solicitudes y calificar compañeros.

## Stack
- React Native + Expo (Expo Go compatible)
- TypeScript · React Navigation v6 · Axios · Expo SecureStore · Expo Location · Expo ImagePicker

## Instalación

```bash
# 1. Clonar y entrar al proyecto
git clone <repo> && cd carpool-utec-mobile

# 2. Instalar dependencias base
npm install

# 3. Instalar paquetes nativos (deja Expo gestionar versiones)
npx expo install expo-secure-store expo-location expo-image-picker expo-camera \
  react-native-screens react-native-safe-area-context

# 4. Configurar entorno
cp .env.example .env
# Edita .env con la URL correcta (ver opciones abajo)
```

## Configurar EXPO_PUBLIC_API_URL

Edita `.env` según dónde corre el backend:

| Entorno | URL |
|---------|-----|
| Web / localhost | `http://localhost:8080/api/v1` |
| Emulador Android | `http://10.0.2.2:8080/api/v1` |
| Celular físico (misma Wi-Fi) | `http://192.168.1.X:8080/api/v1` |

**Celular físico:** reemplaza `192.168.1.X` por la IP LAN de tu PC (`ipconfig` en Windows, `ip addr` en Linux/Mac). El celular y la PC deben estar en la misma red Wi-Fi. El backend debe estar corriendo y el firewall debe permitir el puerto 8080.

## Ejecutar

```bash
# Expo Go en celular físico o emulador
npx expo start

# Abrir en Android
npx expo start --android

# Abrir en iOS
npx expo start --ios
```

Escanea el QR con la app **Expo Go** (iOS/Android).

## Solución de errores de red

| Error | Solución |
|-------|----------|
| `Network Error` / timeout | Verifica que el backend esté corriendo en el puerto 8080 |
| `localhost` no conecta en celular físico | Usa la IP LAN de tu PC, no localhost |
| `10.0.2.2` no conecta en celular real | 10.0.2.2 solo funciona en emulador Android; usa IP LAN para físico |
| 401 en todas las peticiones | El token expiró; cierra sesión y vuelve a ingresar |
| Firewall | Permite el puerto 8080 en el firewall de tu PC |

## Guion de demo

1. **Registro** → Crear cuenta con correo @utec.edu.pe, carrera, ciclo
2. **Publicar viaje** → Modo conductor (con vehículo) o pasajero
3. **Buscar viajes** → Filtrar por sentido y distrito
4. **Solicitar asiento** → Ver detalle y enviar solicitud
5. **Panel de conductor** → Aceptar o rechazar solicitudes
6. **Solicitudes** → Ver estados (PENDING/ACCEPTED/REJECTED/CANCELLED)
7. **Viajes confirmados** → Aparecen en Home tras aceptar
8. **Calificar** → Después de que el `departureTime` pase

## Estructura del proyecto

```
src/
  components/   # UI reutilizable
  contexts/     # AuthContext (sesión)
  data/         # careers.ts, limaPlaces.ts
  hooks/        # useAuth, usePublications, useRequests, useVehicles, useRides
  navigation/   # AppNavigator.tsx
  screens/      # 13 pantallas completas
  services/     # api.ts (Axios+JWT+refresh), authService, y todos los demás
  types/        # Contratos del backend tipados
  utils/        # validators, formatters, errorMessages, locationHelpers
```

## Paleta de colores
- Azul noche: `#0B1F3A`
- Celeste UTEC: `#18A8E0`
- Gris concreto: `#F2F4F7`
- Amarillo pendiente: `#F5C518`
