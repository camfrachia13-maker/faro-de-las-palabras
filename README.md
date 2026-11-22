# El Faro de las Palabras (nombre provisorio)

Aplicación educativa para niños de 6 a 11 años que acompaña el aprendizaje de la lectura y la escritura, con propuestas de lenguaje oral y habilidades cognitivas. Incluye un espacio para familias, docentes y psicopedagogas.

**Aventura:** una tormenta apagó el faro y desparramó las palabras por el archipiélago. Lumi, una luciérnaga guardiana, guía al niño por cuatro islas para recuperarlas. Cada misión jugada enciende un poco más la luz del faro.

| Personaje | Rol | Isla |
|---|---|---|
| Lumi (luciérnaga) | Guía que habla, explica y celebra | Isla de los Sonidos (lectura) |
| Tito (tortuga cartera) | Necesita ayuda para escribir mensajes | Bahía de las Cartas (escritura) |
| Mara (gaviota) | Junta cuentos y escucha relatos | Bosque de los Cuentos (oral y comprensión) |
| Bruno (pulpo) | Arma desafíos para arreglar la lámpara | Torre del Faro (cognitivo) |

## Tecnología

- **Expo SDK 58 + React Native 0.88 + TypeScript (strict).** Una sola base de código para iPhone, iPad y Android, con vista previa web.
- Navegación propia en forma de pila: la app no necesita enlaces profundos, y así queda simple y predecible. Este proyecto no usa Expo Router, aunque el `AGENTS.md` de la plantilla lo sugiere. Si en el futuro se necesitan enlaces profundos, se puede migrar.
- Voz: `expo-speech` usa la síntesis del dispositivo, sin internet. Prefiere voces es-AR y, si no hay, otras de español.
- Grabación opcional: `expo-audio`. Solo funciona si un adulto la habilita, y la grabación no se guarda.
- Persistencia: `@react-native-async-storage/async-storage`, local en el dispositivo (en la web usa localStorage).
- PIN de adultos: SHA-256 con sal (`expo-crypto`), guardado localmente.
- Ilustraciones: SVG originales para personajes, avatares, íconos y faro (`react-native-svg`). Los dibujos de palabras usan, **provisoriamente**, los emoji del sistema.

## Estructura (lógica, contenido e interfaz separados)

```
src/
  domain/        Lógica educativa pura (sin interfaz). Se testea con node.
    types.ts           Modelo de datos: perfiles, intentos, muestras, reglas
    adaptation.ts      Reglas de adaptación transparentes (+ texto para adultos)
    writingAnalysis.ts Análisis descriptivo de escrituras e hipótesis provisorias
    items.ts           Generadores de consignas por actividad/nivel/apoyo
    exploration.ts     Exploración inicial y punto de partida
    profile.ts         Creación de perfil, registro de intentos, recompensas
    report.ts          Evidencias para adultos, sugerencias
  content/       Contenidos editables: léxico, relatos, mundo, definición de actividades
  storage/       Repositorio local (AsyncStorage)
  services/      Voz
  ui/            Componentes, arte SVG, pantallas y "motores" de actividades
tests/           Tests de la lógica educativa
```

Para sumar contenido (palabras, cuentos, cartas, secuencias) solo hace falta editar `src/content/` o las listas de `src/domain/items.ts`, sin tocar la interfaz.

## Cómo ejecutarla

```bash
npm install
npm test             # 13 tests de la lógica educativa
npm run typecheck
npx expo start       # escanear el QR con Expo Go (iPhone/Android)
npm run build:web    # vista previa web en dist/
```

`expo-audio` y `expo-speech` vienen incluidos en Expo Go, así que la app se puede probar en un teléfono sin compilar.

## App web (GitHub Pages)

Cada push a `main` ejecuta `.github/workflows/deploy-web.yml`. El workflow corre el typecheck y los tests, exporta la web y la publica en `https://<usuario>.github.io/<repo>/`.

Para activarlo una sola vez: en el repositorio, ir a **Settings › Pages › Build and deployment › Source: GitHub Actions**.

La web se puede instalar en el celular como una app ("Agregar a pantalla de inicio"), con ícono y pantalla completa. Los datos quedan en el navegador de ese dispositivo.

## Licencia

Todavía no se eligió una licencia. Mientras tanto, todos los derechos quedan reservados para la autora o el autor del proyecto.

## Datos que se guardan (por perfil, solo en el dispositivo)

- Alias y avatar. No se piden nombres reales, fotos ni ubicación.
- Cada intento: actividad, nivel, apoyo, consigna, respuesta, acierto, cantidad de intentos, pistas, repeticiones de la consigna, si escuchó el texto, contexto (exploración, misión o repaso), modo de entrada y duración. La duración **se registra como condición, pero no se usa como indicador**.
- Muestras escritas (original y revisada), con su análisis descriptivo y los apoyos usados.
- Observaciones de adultos, hipótesis registrada por un adulto, cambios de nivel con su motivo y ajustes.
- Desde el espacio para adultos se pueden exportar (JSON) y eliminar.

## Reglas de adaptación (`src/domain/adaptation.ts`)

1. **Más apoyo:** si 2 consignas seguidas quedan sin resolver, o si 3 de las últimas 4 necesitaron ayuda, se suma apoyo (menos opciones, audio, modelo visible). Si ya tiene el apoyo máximo, se baja un nivel.
2. **Aumento gradual:** con 4 consignas seguidas sin pistas y al primer intento, primero se quita apoyo y después se sube de nivel.
3. **Repaso:** cada misión incluye una consigna que retoma una palabra ya resuelta en otra actividad, o una consigna del nivel anterior.
4. **Ajuste adulto:** el adulto puede fijar nivel y apoyo, bloquear los cambios automáticos o desactivar actividades.
5. Las **producciones abiertas** (escritura libre, relato oral) no se califican.

La exploración inicial registra por separado lectura y escritura. La escritura se analiza con producciones abiertas: las hipótesis (presilábica, silábica, silábico-alfabética, alfabética) se muestran como **hipótesis pedagógicas provisorias que requieren revisión profesional**, con al menos 3 muestras y un nivel de confianza explícito.

## Qué se verificó en este entorno

- TypeScript estricto sin errores.
- 13 tests de lógica: reglas de adaptación, análisis de escritura, generación válida de consignas en todas las actividades, niveles y apoyos (repetido 15 veces por la aleatoriedad), recompensas, informes y exploración.
- Build web (`expo export -p web`) y recorrido automatizado en Chrome con viewport de iPhone (390×844): crear perfil, bienvenida, exploración completa, mapa, misiones de las 13 actividades, cierre de sesión, puerta parental, informes y persistencia tras recargar. No hubo errores de consola.

## Qué falta verificar en dispositivos reales

- **Voz:** calidad y acento de la voz sintetizada en iPhone y Android. Los sonidos aislados (/m/, /s/) suenan mejor grabados por una persona: se recomienda grabar audios con una voz rioplatense.
- **Grabación:** permisos de micrófono y funcionamiento en iOS y Android.
- **VoiceOver y TalkBack:** se cargaron etiquetas de accesibilidad, pero falta probarlas con lectores de pantalla reales.
- Rendimiento en equipos de gama baja, rotación en iPad y zonas seguras (notch).
- Validación de los contenidos con docentes y psicopedagogas, y pruebas de uso con niños de distintas edades.

## Antes de publicar en App Store (pendiente)

La app **no está lista para App Store**. Faltan, como mínimo:

- Cuenta de Apple Developer, que es paga y requiere tu autorización. Configurar `ios.bundleIdentifier` (hoy dice `com.CAMBIAR...`), el ícono y la pantalla de inicio definitivos.
- Ilustraciones propias que reemplacen los emoji. Revisar que el nombre y la marca estén disponibles.
- Política de privacidad publicada y etiquetas de privacidad en App Store Connect ("Data Not Collected" si se mantiene todo local).
- Cumplir las pautas de la **categoría Niños** (Guideline 1.3 y 5.1.4: sin publicidad ni analítica de terceros, y puerta parental para enlaces externos o compras). Hay que revisar si la puerta actual alcanza para lo que pida Apple.
- Builds con EAS (`npx eas-cli build -p ios`), TestFlight y pruebas en dispositivos.
- Revisar `ITSAppUsesNonExemptEncryption` y el texto del permiso de micrófono.

No se publicó nada ni se contrató ningún servicio.
