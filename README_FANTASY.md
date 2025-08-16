# ⚽ Fantasy League - Base de Datos de Jugadores

Una aplicación web moderna construida con **Astro** y **Tailwind CSS** que gestiona una liga fantasy de 80 jugadores distribuidos en 4 equipos.

## 🚀 Características

### ✨ Funcionalidades Principales
- **80 jugadores** distribuidos equitativamente en 4 equipos
- **Filtros avanzados** por equipo, posición y búsqueda por nombre
- **Múltiples opciones de ordenamiento** (puntos, valor de mercado, edad, nombre)
- **Estadísticas por equipo** en tiempo real
- **Diseño responsive** y moderno
- **Información detallada** de cada jugador:
  - Foto de perfil
  - Nombre y edad
  - Posición con código de colores
  - Puntos totales
  - Valor de mercado
  - Variación de mercado con indicadores visuales

### 🎨 Equipos
- **Nike FC** - Color naranja
- **Adidas FC** - Color gris
- **Puma FC** - Color azul  
- **Kappa FC** - Color morado

### 📊 Posiciones
- **POR** (Portero) - Amarillo
- **DFC** (Defensa Central) - Azul
- **DC** (Defensa) - Verde
- **MC** (Medio Campo) - Morado

## 🛠️ Instalación y Uso

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [URL_del_repositorio]

# Navegar al directorio
cd proud-planet

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Acceso
Abrir http://localhost:4321/ en tu navegador

## 📁 Estructura de Archivos

```
src/
├── components/
│   └── PlayerCard.astro      # Componente de tarjeta de jugador
├── layouts/
│   └── BaseLayout.astro      # Layout principal
├── pages/
│   └── index.astro           # Página principal
├── data/
│   └── players.json          # Base de datos de jugadores
└── public/
    └── jugadores/            # Imágenes de jugadores
```

## 📋 Formato de Datos

Cada jugador en `players.json` tiene esta estructura:

```json
{
  "nombre": "Yazawa",
  "posicion": "DC", 
  "puntos": 92,
  "valor_mercado": 170000000,
  "variacion": 0,
  "edad": 29,
  "equipo": "Nike FC",
  "foto": "/jugadores/yazawa.png"
}
```

## 🎯 Funcionalidades de la Interfaz

### Filtros Disponibles
- **Por Equipo**: Todos, Nike FC, Adidas FC, Puma FC, Kappa FC
- **Por Posición**: Todas, POR, DFC, DC, MC
- **Búsqueda**: Por nombre de jugador
- **Ordenamiento**: Por puntos, valor de mercado, edad o nombre

### Información Mostrada
- **Contador de resultados**: Muestra cuántos jugadores coinciden con los filtros
- **Estadísticas por equipo**: Número de jugadores, valor total del equipo y promedio de puntos
- **Botón limpiar filtros**: Restaura todos los filtros a su estado inicial

## 🔧 Personalización

### Agregar Jugadores
1. Editar `src/data/players.json`
2. Agregar imagen en `public/jugadores/`
3. Seguir el formato JSON establecido

### Cambiar Colores de Equipos
Editar las configuraciones de colores en:
- `src/layouts/BaseLayout.astro` (configuración de Tailwind)
- `src/components/PlayerCard.astro` (colores de equipos)
- `src/pages/index.astro` (colores de estadísticas)

### Agregar Nuevas Posiciones
1. Actualizar array `posiciones` en `src/pages/index.astro`
2. Agregar colores en `posicionColors` en los componentes

## 🚀 Construcción para Producción

```bash
# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## 🛠️ Tecnologías Utilizadas

- **Astro** - Framework web moderno
- **Tailwind CSS** - Framework CSS utilitario
- **JavaScript Vanilla** - Para interactividad
- **JSON** - Base de datos de jugadores

## 📝 Notas Técnicas

- Las imágenes de jugadores deben estar en formato PNG
- El valor de mercado se almacena en euros (formato completo)
- Las variaciones se muestran en millones con 1 decimal
- El sistema es completamente responsive
- Los filtros son acumulativos (se pueden combinar)

## 🎮 Uso Práctico

Esta aplicación es perfecta para:
- Gestionar ligas fantasy privadas
- Analizar estadísticas de jugadores
- Comparar valores de mercado
- Buscar jugadores específicos
- Visualizar distribución por equipos

---

¡Disfruta explorando tu Fantasy League! ⚽🏆
