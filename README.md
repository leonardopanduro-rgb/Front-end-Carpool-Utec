# Front-end Carpool UTEC

Frontend movil desarrollado con React Native, Expo SDK 54 y TypeScript.

## Aplicacion Expo

```bash
npm install
npx expo start
```

## API

Configura la URL del backend en `.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
```

La app usa unicamente `EXPO_PUBLIC_API_URL`; no hay URL hardcodeada ni fallback
en codigo. Usa `.env.example` como plantilla para web, emulador o celular fisico.
