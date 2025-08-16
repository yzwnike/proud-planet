# 🕷️ BiWenger Scraper

Sistema de web scraping para obtener datos en tiempo real de jugadores desde Biwenger.

## 🚀 Instalación Completa

Las dependencias ya están instaladas, pero si necesitas reinstalar:

```bash
npm install puppeteer cheerio axios node-cron
```

## 🎯 Modos de Uso

### 1. 🎮 Modo Demo (Recomendado para empezar)
Genera datos de ejemplo sin acceder a Biwenger:
```bash
npm run scraper:demo
```

### 2. 🔐 Modo Real (Scraping de Biwenger)
**⚠️ IMPORTANTE: Solo usa TUS propias credenciales**
```bash
npm run scraper
# Sigue las instrucciones para introducir email y contraseña
```

### 3. 🤖 Modo Automático
Para actualizaciones continuas:
```bash
# Configurar intervalos
npm run scraper:config

# Iniciar auto-updater
npm run scraper:auto

# Ver estado
npm run scraper:status

# Ejecutar solo una vez
npm run scraper:once
```

## 📋 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run scraper` | Scraper interactivo (demo o real) |
| `npm run scraper:demo` | Solo modo demo |
| `npm run scraper:auto` | Iniciar auto-updater |
| `npm run scraper:config` | Configurar auto-updater |
| `npm run scraper:status` | Ver estado del auto-updater |
| `npm run scraper:once` | Ejecutar una sola actualización |

## 🔧 Configuración del Auto-Updater

### Intervalos Disponibles:
- **Cada 15 minutos** (⚠️ Intensivo)
- **Cada 30 minutos** 
- **Cada hora** (Recomendado)
- **Cada 6 horas**
- **Diario** (8:00 AM)

### Ejemplo de Configuración:
```bash
npm run scraper:config
```
```
¿Usar modo demo? (s/n): n
Email de Biwenger: tu@email.com
Contraseña: ********

Cada 15 minutos (⚠️ Intensivo) (s/n): n
Cada 30 minutos (s/n): n
Cada hora (Recomendado) (s/n): s
Cada 6 horas (s/n): n
Una vez al día (8:00 AM) (s/n): s
```

## 📊 Datos Extraídos

**🎯 URL Objetivo:** `https://biwenger.as.com/players`

Para cada jugador se obtiene:
- **Nombre**
- **Posición** (POR, DFC, DC, MC)
- **Puntos** totales
- **Valor de mercado** (en euros)
- **Variación** de mercado
- **Edad**
- **Equipo** (asignado aleatoriamente: Nike FC, Adidas FC, Puma FC, Kappa FC)
- **Foto** (placeholder)

## 📁 Archivos Generados

```
scripts/
├── biwenger-scraper.js     # Scraper principal
├── run-scraper.js          # Script interactivo
├── auto-updater.js         # Actualizador automático
├── config.json             # Configuración (creado automáticamente)
└── scraper.log             # Logs del auto-updater

src/data/
├── players.json            # Datos actuales
└── players-backup.json     # Backup automático
```

## 🔒 Consideraciones de Seguridad

### ⚠️ IMPORTANTE:
- **Solo usa TUS propias credenciales** de Biwenger
- **Respeta los términos de uso** de la plataforma
- **No abuses** de la frecuencia de scraping
- **Usa modo demo** para desarrollo y testing

### 🛡️ Buenas Prácticas:
- Empieza con **modo demo**
- Usa intervalos **conservadores** (cada hora o más)
- **Monitorea logs** para detectar problemas
- **Haz backups** regulares de tus datos

## 🚨 Resolución de Problemas

### Problema: "Login fallido"
```bash
# Verificar credenciales
npm run scraper:config

# Probar modo demo
npm run scraper:demo
```

### Problema: "No se encontraron jugadores"
- Biwenger puede haber cambiado su estructura
- Usa modo demo mientras se actualiza el scraper
- Revisa logs: `scripts/scraper.log`

### Problema: Puppeteer no funciona
```bash
# Reinstalar puppeteer
npm uninstall puppeteer
npm install puppeteer
```

### Problema: Memoria alta
- Reduce frecuencia de scraping
- Usa modo headless: editar `headless: true` en `biwenger-scraper.js`

## 📈 Monitoreo

### Ver Logs en Tiempo Real:
```bash
# Windows
Get-Content scripts/scraper.log -Wait -Tail 10

# Linux/Mac
tail -f scripts/scraper.log
```

### Estado del Sistema:
```bash
npm run scraper:status
```

### Estadísticas:
- Total de actualizaciones realizadas
- Última actualización
- Intervalos configurados
- Modo actual (demo/real)

## 🔄 Flujo de Trabajo Recomendado

1. **Primera vez:**
   ```bash
   npm run scraper:demo  # Probar con datos de ejemplo
   ```

2. **Configurar para uso real:**
   ```bash
   npm run scraper:config  # Configurar credenciales e intervalos
   ```

3. **Iniciar auto-updater:**
   ```bash
   npm run scraper:auto    # Ejecutar en segundo plano
   ```

4. **Monitorear:**
   ```bash
   npm run scraper:status  # Ver estado periódicamente
   ```

## 🎨 Integración con la Web

Los datos se guardan automáticamente en `src/data/players.json` y la web de Astro los carga automáticamente. Solo necesitas:

1. Ejecutar el scraper
2. Los datos se actualizan
3. La web muestra los nuevos datos

## ⚡ Desarrollo

### Modificar Selectores CSS:
Si Biwenger cambia su estructura, edita los selectores en `biwenger-scraper.js`:
```javascript
const nombre = element.querySelector('.player-name')?.textContent?.trim();
const puntos = element.querySelector('.points')?.textContent?.trim();
// etc...
```

### Añadir Nuevos Campos:
1. Modifica la función `scrapearJugadores()`
2. Actualiza el esquema en `players.json`
3. Ajusta los componentes de Astro si es necesario

---

## 🎉 ¡Listo!

Ya tienes un sistema completo de scraping que puede:
- ✅ Obtener datos reales de Biwenger
- ✅ Generar datos de demo
- ✅ Actualizar automáticamente
- ✅ Monitorear y hacer logs
- ✅ Mantener backups
- ✅ Integrar con tu web de Fantasy League

**¡Disfruta de tu Fantasy League con datos en tiempo real!** ⚽🚀
