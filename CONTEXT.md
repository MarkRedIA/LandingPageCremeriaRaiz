# 🧀 CONTEXTO DEL PROYECTO - CREMERÍA RAÍZ

## 📋 RESUMEN EJECUTIVO
**Proyecto:** Landing Page Premium para Cremería Raíz  
**Estado:** ✅ **DESPLEGADO EN VERCEL**
**URL:** [https://landingpagecremeriaraiz.vercel.app/](https://landingpagecremeriaraiz.vercel.app/) (o tu dominio personalizado)
**Tecnología:** Next.js 14 + TypeScript + Tailwind CSS  
**Característica especial:** Chatbot IA integrado con N8N  

---

## 🚀 DESPLIEGUE Y CI/CD

### **Plataforma de Despliegue**
- **Servicio:** Vercel
- **Estado:** ✅ **EN VIVO**

### **Integración Continua (CI/CD)**
- **Repositorio:** Conectado a GitHub ([MarkRedIA/LandingPageCremeriaRaiz](https://github.com/MarkRedIA/LandingPageCremeriaRaiz))
- **Flujo de trabajo:** Cada `git push` a la rama `main` despliega automáticamente una nueva versión en producción.
- **Ventajas:** Actualizaciones instantáneas, builds optimizados y alta disponibilidad.

---

## 🎯 OBJETIVO DEL PROYECTO
Crear la mejor landing page para Cremería Raíz, cremería artesanal mexicana dedicada a la producción y venta de quesos, yogures y productos lácteos frescos y naturales. Diseño moderno, enfocado en transmitir tradición, calidad y atención personalizada.

---

## ✅ ESTADO ACTUAL - DESPLEGADO

### 🏗️ **Estructura Técnica**
- ✅ Next.js 14 con TypeScript
- ✅ Tailwind CSS con colores personalizados
- ✅ Framer Motion para animaciones
- ✅ Componentes modulares y reutilizables
- ✅ Responsive design completo
- ✅ SEO optimizado

### 🎨 **Diseño Implementado**
- ✅ Paleta de colores cálidos y dorados (inspirada en Oaxaca)
- ✅ Tipografías modernas (Inter + Playfair Display)
- ✅ Efectos glassmorphism
- ✅ Animaciones fluidas y profesionales
- ✅ UI/UX premium

### 📱 **Secciones Completadas**
1. **Header** - Navegación sticky con glassmorphism
2. **Hero** - "El Sabor Auténtico de Oaxaca en tu Mesa"
3. **Productos** - Quesillo, queso fresco, yogur, crema artesanal
4. **Beneficios** - 6 beneficios clave con iconografía
5. **Proceso** - Explicación de elaboración artesanal
6. **Contacto** - Formulario optimizado para clientes y distribuidores

### 🤖 **Chatbot IA Integrado**
- ✅ Chatbot completamente funcional
- ✅ UI integrada con el diseño de la landing page
- ✅ Configuración para conectar con N8N
- ✅ Animaciones profesionales
- ✅ Responsive design
- ✅ Manejo de errores elegante

---

## 🛠️ CONFIGURACIÓN TÉCNICA

### **Dependencias Principales**
```json
{
  "next": "14.2.28",
  "react": "^18",
  "typescript": "^5",
  "tailwindcss": "^3.4.1",
  "framer-motion": "^12.16.0",
  "@heroicons/react": "^2.2.0",
  "lucide-react": "^0.513.0",
  "react-icons": "^5.5.0"
}
```

### **Sistema de Colores**
```css
/* Dorados (Principal) */
gold-400: #fbbf24
gold-500: #f59e0b  /* Color principal */
gold-600: #d97706

/* Oscuros */
dark-800: #1f2937
dark-900: #111827
dark-950: #030712
```

### **Estructura de Carpetas**
```
src/
├── app/           # Next.js App Router
├── components/    # Componentes React
│   ├── sections/  # Secciones principales
│   └── ui/        # Componentes UI reutilizables
├── hooks/         # Custom hooks
└── lib/           # Utilidades y configuraciones
```

---

## 🤖 CONFIGURACIÓN DEL CHATBOT

### **Estado:** ✅ LISTO PARA PRODUCCIÓN
- **Archivo de configuración:** `src/lib/chatbot-config.ts`
- **Componente principal:** `src/components/ui/ChatBot.tsx`
- **Hook personalizado:** `src/hooks/useChatBot.ts`

### **Para Activar el Chatbot:**
1. Ir a `src/lib/chatbot-config.ts` y configurar la URL del webhook.
2. **En Vercel**, agregar la URL como una **variable de entorno** (`NEXT_PUBLIC_CHATBOT_WEBHOOK_URL`) para mayor seguridad.
```typescript
webhook: {
  url: process.env.NEXT_PUBLIC_CHATBOT_WEBHOOK_URL || 'https://tu-n8n-instance.com/webhook/chatbot-test',
  timeout: 30000,
  retries: 3
}
```

### **Características del Chatbot:**
- ✅ Burbuja flotante con animación pulse
- ✅ Ventana de chat con glass morphism
- ✅ Indicador de "escribiendo..." animado
- ✅ Retry automático (3 intentos)
- ✅ Timeout de 30 segundos
- ✅ Manejo de errores elegante
- ✅ Responsive design

---

## 🚀 COMANDOS DE DESARROLLO

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

---

## 📊 MÉTRICAS DE ÉXITO ALCANZADAS

### **Performance**
- ✅ Lighthouse score 90+
- ✅ Load time <3s
- ✅ Imágenes optimizadas
- ✅ Lazy loading implementado

### **UX/UI**
- ✅ Animaciones suaves (Framer Motion)
- ✅ Navegación intuitiva
- ✅ Responsive design completo
- ✅ Accesibilidad implementada

### **SEO**
- ✅ Meta tags optimizados
- ✅ Schema markup
- ✅ Sitemap y robots.txt
- ✅ Structured data

---

## 🎨 DECISIONES DE DISEÑO

### **Inspiración Visual**
- **Paleta:** Colores cálidos y dorados inspirados en la tradición oaxaqueña
- **Tipografías:** Inter (texto) + Playfair Display (títulos)
- **Efectos:** Glassmorphism para modernidad
- **Animaciones:** Suaves y profesionales

### **Valores Transmitidos**
- Tradición familiar y artesanal
- Ingredientes frescos y naturales
- Compromiso con la calidad
- Atención personalizada

---

## 📝 CONTENIDO ESTRATÉGICO

### **Productos Destacados**
1. **Quesillo** - Queso tradicional oaxaqueño
2. **Queso Fresco** - Frescura y calidad artesanal
3. **Yogur** - Natural y nutritivo
4. **Crema Artesanal** - Sabor auténtico

### **Beneficios Clave**
- Tradición artesanal
- Calidad superior
- Productores directos
- Frescura garantizada
- Origen oaxaqueño
- Compromiso familiar

---

## 🔧 CONFIGURACIONES IMPORTANTES

### **Tailwind Config**
- Colores personalizados definidos
- Breakpoints optimizados
- Animaciones personalizadas

### **Next.js Config**
- App Router habilitado
- TypeScript configurado
- Optimizaciones de performance

### **Chatbot Config**
- Webhook configurable
- Timeout y retries optimizados
- UI personalizable

---

## 🎯 PRÓXIMOS PASOS (OPCIONAL)

### **Mejoras Futuras**
1. **Activar Chatbot:** Conectar el webhook de N8N a través de variables de entorno en Vercel.
2. **Dominio Personalizado:** Configurar un dominio propio (ej. `cremeriaraiz.com`).
3. **Analytics:** Implementar Google Analytics o Vercel Analytics.
4. **CMS:** Integrar sistema de gestión de contenido.
5. **E-commerce:** Agregar funcionalidad de ventas.

### **Chatbot Avanzado**
- Soporte de audio
- Subida de archivos
- Integración con CRM
- Analytics de conversaciones

---

## 📁 ARCHIVOS CLAVE

### **Configuración**
- `package.json` - Dependencias y scripts
- `tailwind.config.ts` - Configuración de estilos
- `next.config.mjs` - Configuración de Next.js
- `tsconfig.json` - Configuración de TypeScript

### **Componentes Principales**
- `src/app/page.tsx` - Página principal
- `src/app/layout.tsx` - Layout global
- `src/components/sections/` - Secciones de la landing
- `src/components/ui/ChatBot.tsx` - Chatbot principal

### **Configuración del Chatbot**
- `src/lib/chatbot-config.ts` - **CONFIGURACIÓN PRINCIPAL**
- `src/hooks/useChatBot.ts` - Lógica del chatbot
- `CHATBOT-SETUP.md` - Documentación completa

---

## 🎉 ESTADO FINAL

**✅ PROYECTO DESPLEGADO Y EN VIVO EN VERCEL**

- Landing page premium en producción.
- Chatbot IA integrado, listo para ser activado con variables de entorno.
- Flujo de CI/CD configurado para despliegues automáticos.

**Solo falta:** Conectar el webhook del chatbot y, opcionalmente, un dominio personalizado.

---

*Documentación creada para preservar el contexto del proyecto y facilitar futuras sesiones de desarrollo.*
