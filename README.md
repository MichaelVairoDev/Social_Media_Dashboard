# 📊 Social Media Dashboard

## 📝 Descripción

Una aplicación web moderna para el seguimiento y análisis de métricas de redes sociales. Permite a los usuarios registrar, visualizar y analizar el rendimiento de sus perfiles en múltiples plataformas sociales, con predicciones de crecimiento y comparativas entre plataformas.

## 🚀 Características Principales

- 📈 Dashboard con resumen de métricas clave
- 📱 Soporte para múltiples plataformas sociales (Facebook, Twitter, Instagram, LinkedIn, YouTube, TikTok, Pinterest)
- 📊 Gráficos interactivos para visualización de datos
- 🔮 Predicciones de crecimiento basadas en datos históricos
- 🔄 Modo de prueba para explorar la aplicación sin datos reales
- 👤 Sistema de autenticación de usuarios
- 📱 Diseño responsive para todos los dispositivos

## 📸 Capturas de Pantalla

### 🏠 Dashboard Principal

![Dashboard Principal](/screenshots/dashboard.png)
_Vista general con resumen de métricas y gráficos_

### 📊 Análisis de Métricas

![Análisis de Métricas](/screenshots/metrics.png)
_Detalle de métricas por plataforma_

### 📈 Gráficos Comparativos

![Gráficos](/screenshots/charts.png)
_Comparativa visual entre diferentes plataformas_

### 🔮 Predicciones

![Predicciones](/screenshots/predictions.png)
_Proyecciones de crecimiento basadas en datos históricos_

## 🚀 Tecnologías Utilizadas

### Frontend

- 🅰️ Angular con TypeScript
- 🎨 Bootstrap para la interfaz de usuario
- 📊 Chart.js para visualización de datos
- 🔥 Firebase Authentication para autenticación
- 🌐 HttpClient para peticiones HTTP

### Backend

- 📦 Node.js con Express
- 🗃️ MongoDB como base de datos
- 🔐 JWT para autenticación
- 📝 TypeScript para tipado estático
- 🔄 Mongoose para modelado de datos

### DevOps

- 🐳 Docker y Docker Compose para containerización
- 🔄 Hot-reload en desarrollo
- 🔒 Variables de entorno para configuración

## 🛠️ Requisitos Previos

- Docker y Docker Compose instalados
- Node.js (versión 14 o superior)
- npm
- Git

## ⚙️ Configuración del Proyecto

1. **Clonar el repositorio**

```bash
git clone https://github.com/MichaelVairoDev/Social_Media_Dashboard.git
cd social-media-dashboard
```

2. **Configurar variables de entorno**

Crea archivos `.env` basados en los archivos de ejemplo:

Para el backend (backend/.env):
```env
PORT=3000
NODE_ENV=development

# Firebase Config
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
```

## 🚀 Iniciar el Proyecto

### Con Docker (Recomendado)

1. **Construir y levantar los contenedores**

```bash
docker compose up --build
```

Esto iniciará:

- Frontend en http://localhost:4200
- Backend en http://localhost:3000

### Sin Docker (Desarrollo local)

1. **Iniciar el Backend**

```bash
cd backend
npm install
npm run dev
```

2. **Iniciar el Frontend**

```bash
cd frontend
npm install
ng serve
```

## 🔍 Funcionalidades Detalladas

### 📊 Dashboard

- Resumen de seguidores y engagement totales
- Distribución de métricas por plataforma
- Tendencias de crecimiento recientes
- Indicadores de rendimiento clave (KPIs)

### 📱 Métricas Sociales

- Registro de métricas para cada plataforma
- Historial de datos por fecha
- Formulario para añadir nuevas métricas
- Visualización tabular de datos históricos

### 📈 Gráficos

- Comparativa entre plataformas
- Evolución temporal de seguidores
- Análisis de engagement
- Filtros por período (día, semana, mes, año)

### 🔮 Predicciones

- Estimación de crecimiento futuro
- Comparativa con datos históricos
- Proyecciones por plataforma
- Análisis de tendencias

### 👤 Autenticación

- Registro de usuarios
- Inicio de sesión
- Datos independientes por usuario
- Protección de rutas privadas

### 🧪 Modo Prueba

- Generación de datos de ejemplo
- Exploración sin necesidad de cuenta
- Activación/desactivación mediante switch
- Indicadores visuales de modo activo

## 🗂️ Estructura del Proyecto

```
Social_Media_Dashboard/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── guards/
│   │   ├── assets/
│   │   └── environments/
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 📝 API Endpoints

### Métricas Sociales

- GET /api/social - Obtener todas las métricas
- GET /api/social/:platform - Obtener métricas por plataforma
- POST /api/social - Crear nuevas métricas
- PUT /api/social/:id - Actualizar métricas existentes
- DELETE /api/social/:id - Eliminar métricas

### Analíticas

- GET /api/analytics/summary - Obtener resumen de analíticas
- GET /api/analytics/period/:timeframe - Obtener datos por período
- GET /api/analytics/compare - Comparar plataformas
- GET /api/analytics/trends - Obtener tendencias
- GET /api/analytics/predictions - Obtener predicciones

### Autenticación

- POST /api/auth/register - Registro de usuario
- POST /api/auth/login - Inicio de sesión
- GET /api/auth/profile - Obtener perfil de usuario
- POST /api/auth/logout - Cerrar sesión

## 🔐 Seguridad

- Autenticación mediante Firebase Auth
- Datos independientes por usuario
- Protección de rutas mediante AuthGuard
- Variables de entorno para datos sensibles

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte o preguntas, por favor abre un issue en el repositorio.

---

⌨️ con ❤️ por [Michael Vairo]
