# Tech Doctor

App Android de utilidades para el trabajo de campo:

- **Dureza del agua**: °dH, °fH, mg/L, ppm, gpg (granos), °e y mmol/L.
- **Piscina**: bicarbonato de sodio a añadir según el test de alcalinidad por pastillas ([método original](https://github.com/dvdgravador/alcalinity)).
- **Cable**: sección recomendada por caída de tensión y por intensidad admisible (IEC/UNE-HD 60364-5-52), con magnetotérmico sugerido.
- **Vasos de expansión**: precarga y volumen para circuito primario cerrado, ACS sanitaria y grupo de presión.

Stack: Vite + React + TypeScript, empaquetado como app nativa con Capacitor 8. Todo funciona sin conexión.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # pruebas de las fórmulas (tests/calc.test.ts)
```

Las fórmulas están en `src/calc/` (sin interfaz, con pruebas) y las pantallas en `src/tools/`.

## Generar el AAB para Google Play

Requisitos: [Android Studio](https://developer.android.com/studio) (trae el JDK y el SDK de Android).

1. `npm run android:sync` — compila la web y la copia al proyecto `android/`.
2. **Una sola vez**, crea la clave de subida (guárdala bien: sin ella no podrás actualizar la app):
   ```bash
   keytool -genkeypair -v -keystore calctecnico-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```
   (Android Studio también la crea desde *Build › Generate Signed App Bundle*.)
3. Copia `android/keystore.properties.example` a `android/keystore.properties` y rellena las contraseñas.
4. Genera el bundle:
   ```bash
   cd android && ./gradlew bundleRelease
   ```
   Sale en `android/app/build/outputs/bundle/release/app-release.aab`. Ese es el archivo que se sube a Play Console (Play ya no admite APK para apps nuevas).
5. Para probar en un móvil: `cd android && ./gradlew assembleDebug` → `android/app/build/outputs/apk/debug/app-debug.apk`, o *Run* en Android Studio con `npm run android:open`.

En cada actualización sube `versionCode` (y `versionName`) en `android/app/build.gradle`.

## Ficha de Play Console

- Icono 512×512: `resources/play-store-icon-512.png` (se genera desde `resources/techdoctor-logo.webp` con `node resources/render.mjs`; luego `npx capacitor-assets generate --android` para los iconos y el splash de Android).
- Banner de la marca: `resources/techdoctor-banner.webp` (sirve de base para el gráfico destacado de 1024×500).
- Política de privacidad: `docs/privacidad.html` (publícala, p. ej. con GitHub Pages, y pega la URL en Play Console).
- Seguridad de los datos: la app **no recoge ni comparte datos**.
- Categoría sugerida: Herramientas. Público objetivo: mayores de 18.
- El identificador `com.davidcarrillo.calctecnico` no se puede cambiar después de la primera subida.
