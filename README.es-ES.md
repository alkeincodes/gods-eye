

# God's Eye

Un panel de inteligencia geoespacial en tiempo real de código abierto construido con CesiumJS. Rastrea satélites, vuelos, aviones militares, terremotos, pasadas de vigilancia, interferencia GPS, buques marítimos, cierres de espacio aéreo y fallos de internet, todo en un globo 3D con superposiciones estilo HUD militar.

**Todas las capas de datos utilizan fuentes de datos abiertas, gratuitas y de acceso público. No se requieren API de pago.**

![License](https://img.shields.io/badge/License-MIT-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![CesiumJS](https://img.shields.io/badge/CesiumJS-1.139-green)
![Vite](https://img.shields.io/badge/Vite-7-purple)

## Características

- **11 Capas de Datos** — Satélites, Vuelos, Militar, Terremotos, Etiquetas de Países, CCTV, Tráfico, Pasadas de Vigilancia, Interferencia GPS, AIS Marítimo, Cierres de Espacio Aéreo, Fallos de Internet
- **Modos Visuales** — Normal, Líneas de escaneo CRT, Visión Nocturna (NVG), Térmico FLIR
- **Sistema de Reproducción** — Recorre posiciones históricas con velocidad ajustable
- **HUD Militar** — Superposición táctica con telemetría de cámara, coordenadas MGRS, estimación de GSD
- **Atajos de Teclado** — Acceso rápido a modos visuales, puntos de referencia y controles de UI
- **100 % Datos Abiertos** — Cada capa de datos funciona con API gratuitas, abiertas y sin autenticación, o conjuntos de datos abiertos

## Requisitos Previos

- **Node.js** >= 18
- **npm** >= 9

## Cómo Empezar

### 1. Clona el repositorio

```bash
git clone https://github.com/alkeincodes/gods-eye.git
cd gods-eye
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Configura las variables de entorno

Copia el archivo de ejemplo de entorno:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token
VITE_OPENSKY_CLIENT_ID=your_opensky_client_id
VITE_OPENSKY_CLIENT_SECRET=your_opensky_client_secret
```

> **Todas las claves de API son opcionales.** La aplicación funciona completamente sin ninguna clave: utiliza mosaicos de OpenStreetMap y acceso anónimo a las API. Las claves solo mejoran la calidad de las imágenes y los límites de velocidad (rate limits).

### 4. Inicia el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### 5. Genera la compilación para producción

```bash
npm run build
npm run preview
```

## Fuentes de Datos

Cada capa de datos en God's Eye funciona con **datos gratuitos, abiertos y de acceso público**. No se utilizan suscripciones de pago ni APIs privadas.

| Capa | Fuente | URL | Autenticación | Actualización | Licencia / Términos |
|-------|--------|-----|------|---------|-----------------|
| Satélites | [CelesTrak](https://celestrak.org/) | `celestrak.org/NORAD/elements/gp.php` | Ninguna | 60 min | Acceso público gratuito |
| Vuelos | [OpenSky Network](https://opensky-network.org/) | `opensky-network.org/api/states/all` | Cuenta gratuita (opcional) | 10s | [Licencia OpenSky](https://opensky-network.org/about/terms-of-use) — gratuita para uso no comercial |
| Militar | [ADSB.lol](https://www.adsb.lol/) | `api.adsb.lol/v2/mil` | Ninguna | 10s | API pública gratuita |
| Terremotos | [USGS](https://earthquake.usgs.gov/) | `earthquake.usgs.gov/earthquakes/feed/` | Ninguna | 5 min | Dominio público (Gobierno de EE. UU.) |
| CCTV | TxDOT | `its.txdot.gov` (lista estática) | Ninguna | 1 min | Datos gubernamentales públicos |
| Tráfico | [Overpass API (OSM)](https://overpass-api.de/) | `overpass-api.de/api/interpreter` | Ninguna | 5 min | [ODbL](https://opendatacommons.org/licenses/odbl/) |
| Vigilancia | [CelesTrak](https://celestrak.org/) | Mismos datos TLE, filtrados por ID NORAD | Ninguna | 1s (propagación) | Acceso público gratuito |
| Interferencia GPS | [GPSJam](https://gpsjam.org/) | `gpsjam.org/data/YYYY-MM-DD-h3_4.csv` | Ninguna | 24h | Datos públicos gratuitos |
| AIS Marítimo | Simulado | Datos simulados (Estrecho de Ormuz) | N/A | 15s | N/A — generado localmente |
| Espacio Aéreo | Estático | Zonas de conflicto/restringidas codificadas | N/A | Nunca | Conocimiento público |
| Fallos de Internet | [IODA](https://ioda.inetintel.cc.gatech.edu/) | `api.ioda.inetintel.cc.gatech.edu/v2/` | Ninguna | 5 min | Datos de investigación académica gratuitos ([Georgia Tech](https://ioda.inetintel.cc.gatech.edu/)) |

### Claves de API Opcionales

Estas claves **no son obligatorias**, pero mejoran la experiencia:

#### Token de Cesium Ion (Opcional)

Proporciona terreno e imágenes satelitales de alta resolución. Sin él, la aplicación usa mosaicos de OpenStreetMap, que funcionan perfectamente.

1. Crea una cuenta gratuita en [cesium.com/ion](https://ion.cesium.com/)
2. Ve a **Access Tokens** y copia tu token predeterminado
3. Establece `VITE_CESIUM_ION_TOKEN` en tu `.env`

#### OpenSky Network (Opcional)

Proporciona datos de vuelos comerciales en tiempo real. Sin credenciales, el acceso anónimo funciona, pero está limitado a ~100 solicitudes/día.

1. Regístrate gratis en [opensky-network.org](https://opensky-network.org/index.php/login)
2. Navega a **Dashboard** → **OAuth** y crea las credenciales del cliente
3. Establece `VITE_OPENSKY_CLIENT_ID` y `VITE_OPENSKY_CLIENT_SECRET` en tu `.env`

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en el puerto 5173 |
| `npm run build` | Verifica tipos y genera la compilación para producción |
| `npm run preview` | Vista previa de la compilación de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run test` | Ejecuta las pruebas con Vitest |

## Atajos de Teclado

| Tecla | Acción |
|-----|--------|
| `1` - `4` | Cambiar modo visual (Normal / CRT / NVG / FLIR) |
| `Q` `W` `E` `R` `T` | Ir a puntos de referencia en la ciudad actual |
| `[` / `]` | Alternar entre ciudades |
| `H` | Alternar interfaz limpia (ocultar superposiciones HUD) |
| `Space` | Reproducir / Pausar (modo de reproducción) |
| `Esc` | Deseleccionar / cerrar paneles |

## Stack Tecnológico

- **Framework** — React 19, Vite 7, TypeScript 5.9
- **Globo 3D** — CesiumJS + Resium
- **Estilos** — Tailwind CSS v4
- **Estado** — Zustand v5
- **Propagación Satelital** — satellite.js (SGP4/SDP4)
- **Iconos** — Lucide React

## Contribuir

¡Las contribuciones son bienvenidas! Siéntete libre de abrir issues y enviar pull requests.

1. Haz un fork del repositorio
2. Crea tu rama de función (`git checkout -b feature/my-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add my feature'`)
4. Haz push a la rama (`git push origin feature/my-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE), lo que te permite usarlo, modificarlo y distribuirlo libremente para cualquier propósito.

## Autor

**Kane Dev** — [Twitter](https://x.com/kanedev06) · [YouTube](https://www.youtube.com/@KaneDev06) · [GitHub](https://github.com/alkeincodes) · [LinkedIn](https://www.linkedin.com/in/alkein-villajos-9520a017b/) · [Facebook](https://www.facebook.com/kanedev06)
