# Dashboard de Ventas Diarias - Cremería Raíz

## Descripción

Este dashboard profesional e interactivo permite analizar las ventas diarias de la hoja GeneralV del archivo Excel `RepGeneralVen16-06.xlsx`. El sistema procesa automáticamente los datos según las especificaciones detalladas y genera visualizaciones interactivas.

## Características

### 📊 Análisis de Datos
- **Total de registros procesados**: Muestra la cantidad de filas procesadas
- **Total general**: Suma total de todas las ventas
- **Público en general**: Total de ventas para clientes "Público en General"
- **Clientes únicos**: Número de clientes diferentes

### 📈 Visualizaciones
- **Gráfico de barras**: Ventas por cliente
- **Gráfico circular**: Distribución porcentual de ventas
- **Tabla detallada**: Desglose completo con porcentajes

### 🎨 Interfaz Moderna
- Diseño responsive y profesional
- Animaciones suaves con Framer Motion
- Tema consistente con la marca Cremería Raíz
- Tooltips interactivos en las gráficas

## Estructura del Archivo Excel

El sistema está configurado para procesar la hoja **GeneralV** con la siguiente estructura:

### Encabezados (Filas 1-5)
- No se procesan

### Encabezados de Columnas (Fila 6)
- Documento (A-B combinadas)
- Fecha (C-D combinadas)
- Folio (E-F combinadas)
- Cliente (G-K combinadas)
- Caja (L-P combinadas)
- Usuario (Q-U combinadas)
- Est (Y-AB combinadas)
- Total (AC-AD combinadas)

### Datos (Fila 7 en adelante)
- Se procesan hasta encontrar "Total venta:"
- Los valores de "Total" se convierten a numérico automáticamente

## Cómo Usar

### 1. Acceso al Dashboard
- Navega a `/dashboard` en la aplicación
- O haz clic en "Dashboard" en el menú de navegación

### 2. Cargar Datos
**Opción A: Archivo Excel**
- Haz clic en el área de carga de archivos
- Selecciona tu archivo `RepGeneralVen16-06.xlsx`
- El sistema procesará automáticamente los datos

**Opción B: Datos de Ejemplo**
- Haz clic en "Cargar Datos de Ejemplo"
- Se cargarán 5 registros de muestra para pruebas

### 3. Análisis de Resultados
- Revisa las tarjetas de estadísticas en la parte superior
- Explora las gráficas interactivas
- Consulta la tabla detallada para información específica

## Datos de Ejemplo

El sistema incluye datos de muestra basados en las especificaciones:

| Cliente | Total |
|---------|-------|
| GUDELIA LUCAS | $1,780.00 |
| DON GERARDO | $1,964.00 |
| Público en General | $539.99 |

**Total General**: $4,283.99

## Tecnologías Utilizadas

- **Next.js 14**: Framework de React
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos y diseño
- **Recharts**: Gráficas interactivas
- **Framer Motion**: Animaciones
- **XLSX**: Procesamiento de archivos Excel
- **Lucide React**: Iconos

## Estructura de Archivos

```
src/
├── app/
│   └── dashboard/
│       └── page.tsx          # Página del dashboard
├── components/
│   └── SalesDashboard.tsx    # Componente principal
├── lib/
│   ├── excel-processor.ts    # Procesador de Excel
│   └── sample-data.ts        # Datos de ejemplo
```

## Personalización

### Modificar Colores
Los colores de las gráficas se pueden personalizar en `SalesDashboard.tsx`:

```typescript
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
  '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
];
```

### Agregar Nuevas Métricas
Para agregar nuevas métricas, modifica la interfaz `DashboardStats` en `excel-processor.ts` y actualiza el procesamiento de datos.

## Soporte

Si encuentras algún problema o necesitas personalizaciones adicionales:

1. Verifica que el archivo Excel tenga la estructura correcta
2. Asegúrate de que la hoja se llame exactamente "GeneralV"
3. Confirma que los datos empiecen en la fila 7
4. Revisa que la columna "Total" contenga valores numéricos válidos

## Próximas Mejoras

- [ ] Exportación de reportes en PDF
- [ ] Filtros por fecha
- [ ] Comparación entre períodos
- [ ] Gráficas de tendencias temporales
- [ ] Dashboard en tiempo real 