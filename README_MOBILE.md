# Carpool UTEC - Frontend Mobile

App universitaria para estudiantes UTEC: conductores publican viajes con precio
fijo por asiento, pasajeros solicitan asientos y conductores aceptan o rechazan
solicitudes.

## Stack

- React Native + Expo SDK 54
- TypeScript
- React Navigation v6
- Axios
- Expo SecureStore en nativo y localStorage en web

## Instalacion

```bash
npm install
cp .env.example .env
npx expo start
```

## Configurar EXPO_PUBLIC_API_URL

La app usa unicamente `EXPO_PUBLIC_API_URL`. No existe URL hardcodeada ni
fallback en codigo.

| Entorno | URL |
|---------|-----|
| Web / localhost | `http://localhost:8080/api/v1` |
| Emulador Android | `http://10.0.2.2:8080/api/v1` |
| Celular fisico (misma Wi-Fi) | `http://192.168.1.X:8080/api/v1` |

Para celular fisico, reemplaza `192.168.1.X` por la IP LAN de tu PC y permite
el puerto del backend en el firewall.

## Flujo principal

1. El conductor registra un vehiculo.
2. El conductor publica un viaje con origen, destino, fecha, hora, asientos y
   precio por asiento.
3. El pasajero ve el precio fijo, elige cantidad de asientos y solicita.
4. El conductor acepta o rechaza la solicitud.
5. Los viajes confirmados aparecen en Home y pueden calificarse al finalizar.

## Verificacion

```bash
npx tsc --noEmit
```
