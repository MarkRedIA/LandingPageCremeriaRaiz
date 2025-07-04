'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStats, SaleRecord } from '@/lib/excel-processor';
import { Upload, FileText, DollarSign, Users, Divide, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Funciones de formato de moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(value);
};

const formatCurrencySafe = (value: number) => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return formatCurrency(0);
  return formatCurrency(value);
};

const MONTHS_MAP = {
  '01': 'Enero', '1': 'Enero',
  '02': 'Febrero', '2': 'Febrero',
  '03': 'Marzo', '3': 'Marzo',
  '04': 'Abril', '4': 'Abril',
  '05': 'Mayo', '5': 'Mayo',
  '06': 'Junio', '6': 'Junio',
  '07': 'Julio', '7': 'Julio',
  '08': 'Agosto', '8': 'Agosto',
  '09': 'Septiembre', '9': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviembre',
  '12': 'Diciembre',
};

// Convierte un serial de fecha de Excel a DD/MM/YYYY
function excelDateToString(serial: number): string {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400; // seconds
  const date_info = new Date(utc_value * 1000);
  const day = String(date_info.getUTCDate()).padStart(2, '0');
  const month = String(date_info.getUTCMonth() + 1).padStart(2, '0');
  const year = date_info.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// Agrupa ventas por año y mes y calcula totales por mes
function getMonthlyTotals(sales: SaleRecord[]) {
  const grouped: Record<string, Record<string, number>> = {};
  sales.forEach(sale => {
    const [, month, year] = sale.fecha.split('/');
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = 0;
    grouped[year][month] += sale.total;
  });
  return grouped;
}

function getMonthName(month: string): string {
  return MONTHS_MAP[month as keyof typeof MONTHS_MAP] || month;
}

// Tooltip personalizado para las gráficas
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow text-xs text-gray-800 border border-gray-200">
        <div className="font-semibold mb-1">{label}</div>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SalesDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allSales, setAllSales] = useState<SaleRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'cliente' | 'total' | 'frecuencia' | 'ultimaCompra' | 'ticketPromedio'>('total');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasAttemptedUpload(true);
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array' });
        console.log('Hojas encontradas:', workbook.SheetNames);
        const worksheet = workbook.Sheets['GeneralV'];
        if (!worksheet) {
          setError('El archivo no contiene la estructura requerida para ejecutar el dashboard. La hoja "GeneralV" es necesaria.');
          setAllSales([]);
          setStats(null);
          setLoading(false);
          // Esperar 3 segundos y refrescar la página
          setTimeout(() => {
            window.location.reload();
          }, 3000);
          return;
        }
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 6 });
        const salesData: SaleRecord[] = [];
        let totalGeneral = 0;
        let publicoEnGeneral = 0;
        const clientTotals: { [key: string]: number } = {};
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i] as (string | number | null)[];
          console.log(`Fila ${i + 7}:`, row);
          if (row[0] && typeof row[0] === 'string' && row[0].includes('Total venta:')) break;
          // Limpia y extrae fecha y total (elimina todos los espacios)
          let rawFecha = row[2];
          let fechaSolo = '';
          if (typeof rawFecha === 'number') {
            fechaSolo = excelDateToString(rawFecha);
          } else {
            rawFecha = String(rawFecha || '').replace(/\s+/g, '');
            fechaSolo = rawFecha.slice(0, 10);
          }
          const rawTotal = String(row[28] || '').replace(/[$,\s]/g, '');
          // Valida fecha y total
          const fechaValida = /^\d{2}\/\d{2}\/\d{4}$/.test(fechaSolo);
          const totalValue = parseFloat(rawTotal);
          console.log(`Fila ${i + 7}: fecha='${rawFecha}', fechaSolo='${fechaSolo}', total='${rawTotal}'`);
          if (!fechaValida) {
            console.log(`Fila ${i + 7} descartada: fecha inválida (${rawFecha})`);
            continue;
          }
          if (isNaN(totalValue)) {
            console.log(`Fila ${i + 7} descartada: total inválido (${rawTotal})`);
            continue;
          }
          // Procesa la fila si fecha y total son válidos
          const sale = {
            documento: String(row[0] || '').trim(),
            fecha: fechaSolo,
            folio: parseInt(String(row[4] || '0')) || 0,
            cliente: String(row[6] || '').trim(),
            caja: String(row[11] || '').trim(),
            usuario: String(row[16] || '').trim(),
            est: String(row[24] || '').trim(),
            total: totalValue
          };
          salesData.push(sale);
          totalGeneral += totalValue;
          if (clientTotals[sale.cliente]) {
            clientTotals[sale.cliente] += totalValue;
          } else {
            clientTotals[sale.cliente] = totalValue;
          }
          if (sale.cliente.toLowerCase().includes('público en general')) {
            publicoEnGeneral += totalValue;
          }
          console.log(`Fila ${i + 7} procesada: fecha=${fechaSolo}, total=${totalValue}`);
        }
        console.log('Ventas extraídas:', salesData);
        salesData.forEach(sale => console.log('Fecha:', sale.fecha));
        setAllSales(salesData);
        // Calcular métricas iniciales
        const ventasPorCliente = Object.entries(clientTotals)
          .map(([cliente, total]) => ({ cliente, total }))
          .sort((a, b) => b.total - a.total);
        const ticketPromedio = salesData.length > 0 ? totalGeneral / salesData.length : 0;
        const ventaMaxima = ventasPorCliente.length > 0 ? ventasPorCliente[0].total : 0;
        const ventaMinima = ventasPorCliente.length > 0 ? ventasPorCliente[ventasPorCliente.length - 1].total : 0;
        const clienteMayorCompra = ventasPorCliente.length > 0 ? ventasPorCliente[0].cliente : '';
        const clienteMenorCompra = ventasPorCliente.length > 0 ? ventasPorCliente[ventasPorCliente.length - 1].cliente : '';
        setStats({
          totalRegistros: salesData.length,
          totalGeneral,
          publicoEnGeneral,
          ventasPorCliente,
          ticketPromedio,
          ventaMaxima,
          ventaMinima,
          clienteMayorCompra,
          clienteMenorCompra
        });
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
      setLoading(false);
    }
  }, []);

  // Extraer años y meses únicos de allSales
  const years = Array.from(new Set(allSales.map(s => {
    const parts = s.fecha.split('/');
    return parts.length === 3 ? parts[2] : undefined;
  }))).filter(Boolean);
  const monthsRaw = Array.from(new Set(allSales.map(s => {
    const parts = s.fecha.split('/');
    return parts.length === 3 ? parts[1] : undefined;
  }))).filter(Boolean);
  const months = monthsRaw.map(m => ({ value: m, label: MONTHS_MAP[String(m) as keyof typeof MONTHS_MAP] || m }));
  console.log('Años detectados:', years);
  console.log('Meses detectados:', months);

  // Filtrar ventas por año y mes
  const filteredSales = allSales.filter(s => {
    const yearMatch = selectedYear ? s.fecha.split('/')[2] === selectedYear : true;
    const monthMatch = selectedMonth ? s.fecha.split('/')[1] === selectedMonth : true;
    return yearMatch && monthMatch;
  });

  // Recalcular stats filtrados
  const filteredStats = React.useMemo(() => {
    if (!stats || filteredSales.length === 0) return stats;
    let totalGeneral = 0;
    let publicoEnGeneral = 0;
    const clientTotals: { [key: string]: number } = {};
    filteredSales.forEach(sale => {
      totalGeneral += sale.total;
      if (clientTotals[sale.cliente]) {
        clientTotals[sale.cliente] += sale.total;
      } else {
        clientTotals[sale.cliente] = sale.total;
      }
      if (sale.cliente.toLowerCase().includes('público en general')) {
        publicoEnGeneral += sale.total;
      }
    });
    const ventasPorCliente = Object.entries(clientTotals)
      .map(([cliente, total]) => ({ cliente, total }))
      .sort((a, b) => b.total - a.total);
    const ticketPromedio = filteredSales.length > 0 ? totalGeneral / filteredSales.length : 0;
    const ventaMaxima = ventasPorCliente.length > 0 ? ventasPorCliente[0].total : 0;
    const ventaMinima = ventasPorCliente.length > 0 ? ventasPorCliente[ventasPorCliente.length - 1].total : 0;
    const clienteMayorCompra = ventasPorCliente.length > 0 ? ventasPorCliente[0].cliente : '';
    const clienteMenorCompra = ventasPorCliente.length > 0 ? ventasPorCliente[ventasPorCliente.length - 1].cliente : '';
    return {
      ...stats,
      totalRegistros: filteredSales.length,
      totalGeneral,
      publicoEnGeneral,
      ventasPorCliente,
      ticketPromedio,
      ventaMaxima,
      ventaMinima,
      clienteMayorCompra,
      clienteMenorCompra
    };
  }, [stats, filteredSales]);

  // Construye comparativo anual
  const comparativoAnual: Array<{
    year: string;
    month: string;
    ventasActual: number;
    ventasAnterior: number | null;
    diferencia: number | null;
    porcentaje: number | null;
  }> = [];
  const monthlyTotals = React.useMemo(() => getMonthlyTotals(allSales), [allSales]);
  Object.keys(monthlyTotals).sort().forEach(year => {
    const months = Object.keys(monthlyTotals[year]).sort((a, b) => Number(a) - Number(b));
    months.forEach((month, idx) => {
      const ventasActual = monthlyTotals[year][month];
      if (month === '01' || month === '1') {
        comparativoAnual.push({
          year, month, ventasActual, ventasAnterior: null, diferencia: null, porcentaje: null
        });
      } else {
        const prevMonth = String(Number(month) - 1).padStart(2, '0');
        const ventasAnterior = monthlyTotals[year][prevMonth] ?? 0;
        const diferencia = ventasActual - ventasAnterior;
        const porcentaje = ventasAnterior > 0 ? (diferencia / ventasAnterior) * 100 : null;
        comparativoAnual.push({
          year, month, ventasActual, ventasAnterior, diferencia, porcentaje
        });
      }
    });
  });

  // Comparativo del mes filtrado
  let comparativoFiltrado: typeof comparativoAnual[0] | null = null;
  if (selectedYear && selectedMonth && monthlyTotals[selectedYear] && monthlyTotals[selectedYear][selectedMonth]) {
    const ventasActual = monthlyTotals[selectedYear][selectedMonth];
    if (selectedMonth === '01' || selectedMonth === '1') {
      comparativoFiltrado = {
        year: selectedYear, month: selectedMonth, ventasActual, ventasAnterior: null, diferencia: null, porcentaje: null
      };
    } else {
      const prevMonth = String(Number(selectedMonth) - 1).padStart(2, '0');
      const ventasAnterior = monthlyTotals[selectedYear][prevMonth] ?? 0;
      const diferencia = ventasActual - ventasAnterior;
      const porcentaje = ventasAnterior > 0 ? (diferencia / ventasAnterior) * 100 : null;
      comparativoFiltrado = {
        year: selectedYear, month: selectedMonth, ventasActual, ventasAnterior, diferencia, porcentaje
      };
    }
  }

  // 1. Determinar los meses a mostrar según el filtro de año y mes
  const mesesDelAnio = React.useMemo(() => {
    if (!selectedYear) return [];
    if (selectedMonth) {
      return [selectedMonth];
    }
    // Mostrar todos los meses presentes en el año filtrado
    const meses = allSales
      .filter(s => s.fecha.split('/')[2] === selectedYear)
      .map(s => s.fecha.split('/')[1]);
    return Array.from(new Set(meses)).sort((a, b) => Number(a) - Number(b));
  }, [allSales, selectedYear, selectedMonth]);

  // 2. Calcular ventas por mes para cada cliente
  const clientesExtendidos = React.useMemo(() => {
    if (!filteredStats) return [];
    return filteredStats.ventasPorCliente.map((item) => {
      const compras = allSales.filter(s => s.cliente === item.cliente);
      const frecuencia = compras.length;
      const ultimaCompra = compras.reduce((acc, curr) => {
        if (!acc) return curr.fecha;
        const [d1, m1, y1] = acc.split('/').map(Number);
        const [d2, m2, y2] = curr.fecha.split('/').map(Number);
        const date1 = new Date(y1, m1 - 1, d1);
        const date2 = new Date(y2, m2 - 1, d2);
        return date2 > date1 ? curr.fecha : acc;
      }, '');
      const ticketPromedio = frecuencia > 0 ? item.total / frecuencia : 0;
      // Ventas por mes
      const ventasPorMes: Record<string, number> = {};
      mesesDelAnio.forEach(mes => {
        ventasPorMes[mes] = compras
          .filter(s => selectedYear && s.fecha.split('/')[2] === selectedYear && s.fecha.split('/')[1] === mes)
          .reduce((acc, curr) => acc + curr.total, 0);
      });
      return {
        ...item,
        frecuencia,
        ultimaCompra,
        ticketPromedio,
        ventasPorMes
      };
    });
  }, [filteredStats, allSales, mesesDelAnio, selectedYear]);

  // Filtrar por búsqueda
  const clientesFiltrados = clientesExtendidos.filter(c => c.cliente.toLowerCase().includes(searchTerm.toLowerCase()));

  // Ordenar
  const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'cliente') cmp = a.cliente.localeCompare(b.cliente);
    if (sortBy === 'total') cmp = a.total - b.total;
    if (sortBy === 'frecuencia') cmp = a.frecuencia - b.frecuencia;
    if (sortBy === 'ultimaCompra') cmp = a.ultimaCompra.localeCompare(b.ultimaCompra);
    if (sortBy === 'ticketPromedio') cmp = a.ticketPromedio - b.ticketPromedio;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  // Paginación
  const totalPages = Math.ceil(clientesOrdenados.length / rowsPerPage);
  const clientesPagina = clientesOrdenados.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Calcular minWidth dinámico para la gráfica de barras
  const minWidthBarChart = Math.max(1200, (filteredStats?.ventasPorCliente.length || 0) * 80);

  // Función para generar el PDF ejecutivo
  const handleDownloadExecutivePDF = async () => {
    const doc = new jsPDF('p', 'pt', 'letter');
    // Obtener dimensiones reales de la hoja Letter
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomMargin = 28.35; // 1 cm en puntos
    const chartBlockHeight = 180; // Altura total del bloque de la gráfica (ajustable)
    // Posición del título de la gráfica
    const chartTitleY = pageHeight - bottomMargin - chartBlockHeight + 56 - 18; // Título arriba del bloque
    // El bloque de la gráfica (sin el título) BAJADO 2 LÍNEAS (28pt)
    const chartBlockY = pageHeight - bottomMargin - chartBlockHeight + 14 + 28;
    
    // Logotipo
    const logoUrl = '/images/LogoCr.jpg';
    const logoImg = await fetch(logoUrl).then(r => r.blob()).then(blob => new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    }));
    doc.addImage(logoImg, 'JPEG', 40, 28.35, 70, 70); // 1 cm desde el borde superior
    
    // Título principal - Times tamaño 22
    doc.setFont('times');
    doc.setFontSize(22);
    doc.setTextColor('#ea580c');
    doc.text('Resumen Ejecutivo de Ventas', pageWidth / 2, 28.35 + 30, { align: 'center' }); // 1 cm + 30pt
    
    // Fecha de generación - Times tamaño 10
    doc.setFont('times');
    doc.setFontSize(10);
    doc.setTextColor('#333');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28.35 + 50, { align: 'center' }); // 1 cm + 50pt
    
    // 1. Métricas principales con iconos, colores y layout igual que el dashboard
    const metricIcons = [
      '/images/filetext.svg', // Total de ventas
      '/images/users.svg',    // Clientes totales
      '/images/dollar.svg',   // Total general
      '/images/divide.svg',   // Ticket promedio
      '/images/arrowup.svg',  // Venta máxima
      '/images/arrowdown.svg' // Venta mínima
    ];
    const metricBgColors = [
      [255, 255, 255], // blanco
      [255, 255, 255], // blanco
      [255, 255, 255], // blanco
      [255, 255, 255], // blanco
      [255, 255, 255], // blanco
      [255, 255, 255]  // blanco
    ];
    const metricTextColors = [
      '#2563eb', // azul
      '#9333ea', // morado
      '#16a34a', // verde
      '#0891b2', // cyan
      '#eab308', // amarillo
      '#db2777'  // rosa
    ];
    const metricTitles = [
      'Total de ventas',
      'Clientes totales',
      'Total general',
      'Ticket promedio',
      'Venta máxima',
      'Venta mínima',
    ];
    const metricValues = filteredStats ? [
      filteredStats.totalRegistros?.toLocaleString('es-MX') || '--',
      filteredStats.ventasPorCliente.length || '--',
      formatCurrency(filteredStats.totalGeneral || 0),
      formatCurrencySafe(filteredStats.ticketPromedio || 0),
      `${formatCurrency(filteredStats.ventaMaxima || 0)} (${filteredStats.clienteMayorCompra || ''})`,
      `${formatCurrency(filteredStats.ventaMinima || 0)} (${filteredStats.clienteMenorCompra || ''})`,
    ] : ['--','--','--','--','--','--'];
    const cardWidth = 140;
    const cardHeight = 65;
    const cardGap = 18;
    const startY = 111;
    for (let i = 0; i < 6; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = 40 + col * (cardWidth + cardGap);
      const yCard = startY + row * (cardHeight + 18) - (i >= 3 ? 14 : 0);
      // Fondo de tarjeta blanco con borde negro sutil
      const bgColor = Array.isArray(metricBgColors[i]) ? metricBgColors[i] : [255,255,255];
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      // Borde negro de 0.5pt para TODOS los layouts
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      doc.roundedRect(x, yCard, cardWidth, cardHeight, 8, 8, 'F');
      doc.roundedRect(x, yCard, cardWidth, cardHeight, 8, 8, 'S');
      // Icono - Dibujar iconos básicos directamente en el PDF
      const iconX = x + cardWidth / 2;
      const iconY = yCard + 17;
      
      doc.setFillColor(typeof metricTextColors[i] === 'string' ? metricTextColors[i] : '#000');
      doc.setDrawColor(typeof metricTextColors[i] === 'string' ? metricTextColors[i] : '#000');
      doc.setLineWidth(1);
      
      switch(i) {
        case 0: // FileText - Total de ventas
          doc.rect(iconX - 6, iconY - 6, 12, 12, 'S');
          doc.line(iconX - 4, iconY - 2, iconX + 2, iconY - 2);
          doc.line(iconX - 4, iconY, iconX + 2, iconY);
          doc.line(iconX - 4, iconY + 2, iconX + 2, iconY + 2);
          break;
        case 1: // Users - Clientes totales
          doc.circle(iconX - 3, iconY - 2, 2, 'F');
          doc.circle(iconX + 3, iconY - 2, 2, 'F');
          doc.circle(iconX, iconY + 3, 2, 'F');
          break;
        case 2: // DollarSign - Total general
          doc.line(iconX, iconY - 6, iconX, iconY + 6);
          doc.ellipse(iconX, iconY - 2, 4, 2, 'S');
          doc.ellipse(iconX, iconY + 2, 4, 2, 'S');
          break;
        case 3: // Divide - Ticket promedio
          doc.circle(iconX, iconY - 4, 1.5, 'F');
          doc.line(iconX - 4, iconY, iconX + 4, iconY);
          doc.circle(iconX, iconY + 4, 1.5, 'F');
          break;
        case 4: // ArrowUpCircle - Venta máxima
          doc.circle(iconX, iconY, 4, 'S');
          doc.line(iconX, iconY - 3, iconX, iconY + 1);
          doc.line(iconX - 2, iconY - 1, iconX, iconY - 3);
          doc.line(iconX + 2, iconY - 1, iconX, iconY - 3);
          break;
        case 5: // ArrowDownCircle - Venta mínima
          doc.circle(iconX, iconY, 4, 'S');
          doc.line(iconX, iconY - 1, iconX, iconY + 3);
          doc.line(iconX - 2, iconY + 1, iconX, iconY + 3);
          doc.line(iconX + 2, iconY + 1, iconX, iconY + 3);
          break;
      }
      // Título - Times tamaño 10 con estilos específicos
      doc.setFont('times');
      doc.setFontSize(10);
      doc.setTextColor(typeof metricTextColors[i] === 'string' ? metricTextColors[i] : '#000');
      if (i === 0) { // "Total de ventas" en bold
        doc.setFont('times', 'bold');
      } else if (i === 1) { // "Clientes totales" sin bold
        doc.setFont('times', 'normal');
      } else {
        doc.setFont('times', 'normal');
      }
      doc.text(metricTitles[i], x + cardWidth / 2, yCard + 32, { align: 'center' });
      // Valor - Times tamaño variable según longitud, en negro bold
      if (i === 4 || i === 5) { // Venta máxima o mínima
        const [monto, ...clienteArr] = String(metricValues[i]).split(' (');
        let cliente = clienteArr.length ? clienteArr.join(' (').replace(')', '') : '';
        if (cliente.length > 12) cliente = cliente.slice(0, 12) + '...';
        doc.setFont('times', 'bold');
        doc.setFontSize(monto.length > 10 ? 11 : 13);
        doc.setTextColor('#000000');
        doc.text(monto, x + cardWidth / 2, yCard + 48, { align: 'center' });
        if (cliente) {
          doc.setFont('times', 'normal');
          doc.setFontSize(10);
          doc.setTextColor('#888');
          doc.text(cliente, x + cardWidth / 2, yCard + 58, { align: 'center' });
        }
      } else {
        doc.setFont('times', 'bold');
        doc.setFontSize(String(metricValues[i]).length > 10 ? 11 : 13);
        doc.setTextColor('#000000');
        doc.text(String(metricValues[i]), x + cardWidth / 2, yCard + 54, { align: 'center' });
      }
    }
    let y = startY + 2 * (cardHeight + 18);
    // Filtra el top 15 clientes para la gráfica del PDF
    const top15Clientes = [...(filteredStats?.ventasPorCliente || [])].slice(0, 15);
    // Gráfica de barras (como imagen)
    const pdfChartEl = document.querySelector('.pdf-bar-chart .recharts-wrapper');
    if (pdfChartEl) {
      const svg = pdfChartEl.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        const svg64 = btoa(unescape(encodeURIComponent(svgData)));
        const image64 = 'data:image/svg+xml;base64,' + svg64;
        await new Promise<void>((resolve) => {
          img.onload = () => {
            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
            }
            resolve();
          };
          img.src = image64;
        });
        const chartImg = canvas.toDataURL('image/png');
        // Título de gráfica - Times tamaño 14
        doc.setFont('times');
        doc.setFontSize(14);
        doc.setTextColor('#ea580c');
        doc.text('Ventas por Cliente', 297, y - 14, { align: 'center' });
        doc.addImage(chartImg as string, 'PNG', 40, y - 4, 500, 220);
        y += 240;
      }
    }
    // Comparativo anual - Times tamaño 14 para título
    doc.setFont('Times');
    doc.setFontSize(14);
    doc.setTextColor('#ea580c');
    doc.text('Comparación de Ventas: Mes vs Mes Anterior', 297, y - 14, { align: 'center' });
    const comparativoHead = ['Mes/Año', 'Ventas Mes Actual', 'Ventas Mes Anterior', 'Diferencia', '% Diferencia'];
    const comparativoBody = comparativoAnual.map(row => [
      `${getMonthName(row.month)} ${row.year}`,
      formatCurrency(row.ventasActual),
      row.ventasAnterior !== null ? formatCurrency(row.ventasAnterior) : '--',
      row.diferencia !== null ? formatCurrency(row.diferencia) : '--',
      row.porcentaje !== null ? row.porcentaje.toFixed(1) + '%' : '--',
    ]);
    doc.setFont('Times');
    autoTable(doc, {
      startY: y - 4,
      head: [comparativoHead],
      body: comparativoBody,
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      margin: { left: 40, right: 40 },
      styles: { cellPadding: 3, fontSize: 10 },
    });
    y = doc.lastAutoTable.finalY + 20;

    // --- Gráfica de Variación Porcentual Mensual como bloque (incluye título de la gráfica) ---
    if (comparativoAnual.length > 0) {
      let y = chartBlockY;
      doc.setFont('Times');
      doc.setFontSize(14);
      doc.setTextColor('#ea580c');
      doc.text('Variación Porcentual Mensual', 297, y + 14, { align: 'center' });
      y += 18;
      const chartData = comparativoAnual.filter(row => row.porcentaje !== null);
      if (chartData.length > 0) {
        const visualTop = Math.max(Math.max(...chartData.map(d => Math.abs(d.porcentaje!))), 2);
        const visualBottom = Math.min(Math.min(...chartData.map(d => d.porcentaje!)), 0);
        const visualRange = visualTop - visualBottom;
        const chartPadding = 20;
        const chartHeight = 120;
        const chartWidth = 400;
        const desplazamientoX = 40;
        const chartX = (595 - chartWidth) / 2 + desplazamientoX;
        const chartY = y;
        const zeroY = chartY + chartPadding + (visualTop - 0) * ((chartHeight - 2 * chartPadding) / visualRange);
        // Ejes
        doc.setDrawColor('#333');
        doc.setLineWidth(0.5);
        doc.line(chartX, zeroY, chartX + chartWidth, zeroY);
        doc.line(chartX, chartY + chartPadding, chartX, chartY + chartHeight - chartPadding);
        doc.setFont('Times');
        doc.setFontSize(7);
        doc.setTextColor('#333');
        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
          const yValue = visualBottom + (visualRange * i / ySteps);
          const yPos = chartY + chartPadding + (visualTop - yValue) * ((chartHeight - 2 * chartPadding) / visualRange);
          doc.text(`${yValue.toFixed(0)}%`, chartX - 3, yPos + 1, { align: 'right' });
          if (i > 0 && i < ySteps) {
            doc.setDrawColor('#e5e7eb');
            doc.setLineWidth(0.3);
            doc.line(chartX, yPos, chartX + chartWidth, yPos);
          }
        }
        // Barras y etiquetas
        const barWidth = Math.min(chartWidth / chartData.length, 25);
        chartData.forEach((row, index) => {
          const x = chartX + index * (chartWidth / chartData.length) + (chartWidth / chartData.length - 25) / 2;
          const percentage = row.porcentaje!;
          const barHeight = Math.abs(percentage) * ((chartHeight - 2 * chartPadding) / visualRange);
          if (percentage >= 0) {
            doc.setFillColor(34, 197, 94);
          } else {
            doc.setFillColor(239, 68, 68);
          }
          let barY;
          if (percentage >= 0) {
            barY = zeroY - barHeight;
          } else {
            barY = zeroY;
          }
          doc.rect(x, barY, 25, barHeight, 'F');
          doc.setDrawColor('#333');
          doc.setLineWidth(0.3);
          doc.rect(x, barY, 25, barHeight, 'S');
          doc.setFont('Times');
          doc.setFontSize(7);
          doc.setTextColor('#333');
          // Nombre del mes y porcentaje juntos, alineados horizontalmente a la altura del valor
          let labelY;
          if (percentage >= 0) {
            labelY = barY - 2;
          } else {
            labelY = barY + barHeight + 12;
          }
          const monthLabel = getMonthName(row.month);
          const labelText = `${monthLabel}  ${percentage >= 0 ? '' : '-'}${Math.abs(percentage).toFixed(1)}%`;
          doc.text(labelText, x + 12.5, labelY, { align: 'center' });
        });
        // Título del eje Y desplazado con la gráfica
        doc.setFont('Times');
        doc.setFontSize(8);
        doc.setTextColor('#333');
        doc.text('Variación (%)', chartX, chartY + chartHeight / 2, { align: 'center', angle: 90 });
      }
    }
    // Pie de página y numeración en página 1
    doc.setFont('times');
    doc.setFontSize(9);
    doc.setTextColor('#888');
    doc.text('Reporte generado automáticamente por el Dashboard de Cremería Raíz', 40, pageHeight - 20);
    doc.text('Pág.: 1', pageWidth - 40, pageHeight - 20, { align: 'right' });
    // Salto de página para la gráfica de variación porcentual
    doc.addPage();
    y = 60;
    // Detalle de Ventas por Cliente - Times tamaño 14 para título
    doc.setFont('times');
    doc.setFontSize(14);
    doc.setTextColor('#ea580c');
    doc.text('Detalle de Ventas por Cliente', 297, y, { align: 'center' });
    const detalleHead = ['No.', 'Cliente', 'Total', '%', 'Frecuencia', 'Última compra', 'Ticket Prom.', ...mesesDelAnio.map(mes => getMonthName(mes))];
    const detalleBody = clientesExtendidos.slice(0, 10).map((item, idx) => [
      idx + 1,
      item.cliente,
      formatCurrency(item.total),
      ((item.total / filteredStats.totalGeneral) * 100).toFixed(1) + '%',
      item.frecuencia,
      item.ultimaCompra,
      formatCurrency(item.ticketPromedio),
      ...mesesDelAnio.map(mes => formatCurrency(item.ventasPorMes?.[mes] || 0)),
    ]);
    // Configurar fuente para la tabla de detalle
    doc.setFont('times');
    autoTable(doc, {
      startY: y + 10,
      head: [detalleHead],
      body: detalleBody,
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
      styles: { cellPadding: 2, fontSize: 9 },
      didDrawPage: (data) => {
        // Pie de página y numeración en página 2
        doc.setFont('times');
        doc.setFontSize(9);
        doc.setTextColor('#888');
        doc.text('Reporte generado automáticamente por el Dashboard de Cremería Raíz', 40, doc.internal.pageSize.height - 20);
        doc.text('Pág.: 2', pageWidth - 40, doc.internal.pageSize.height - 20, { align: 'right' });
      }
    });
    doc.save('Resumen_Ejecutivo_CremeriaRaiz.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-center justify-center mb-6"
        >
          <div className="absolute left-0 top-0 flex items-center h-full pl-2">
            <Image 
              src="/images/LogoCr.jpg" 
              alt="Logo Cremería Raíz" 
              width={83} 
              height={83} 
              className="rounded-2xl border-4 border-gold-400 shadow-2xl object-contain transition-transform duration-300 hover:scale-105 hover:shadow-gold-400/40" 
            />
          </div>
          <h2 className="text-4xl font-extrabold text-orange-600 mb-2 tracking-wide">Cremería Raíz</h2>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard de Ventas Diarias
          </h1>
          <p className="text-gray-600">
            Análisis profesional de ventas por cliente
          </p>
        </motion.div>

        {/* File Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* File Upload Section */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center w-full">Cargar archivo de Excel</h3>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500">Archivo Excel (.xlsx)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center mt-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Procesando archivo...</p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </motion.div>

        {/* Filtros por año y mes tipo botonera estilo caja */}
        {hasAttemptedUpload && !loading && !error && allSales.length === 0 && (
          <div className="text-center text-red-600 font-semibold mb-4">No se encontraron ventas válidas en el archivo. Verifica el nombre de la hoja y el formato de las fechas.</div>
        )}
        {allSales.length > 0 && (
          <div className="flex flex-col md:flex-row gap-8 mb-8 items-start justify-center">
            {/* Filtro de Año */}
            <div className="bg-white border-2 border-orange-300 rounded-lg p-4 min-w-[220px]">
              <div className="font-bold text-2xl text-orange-600 mb-3 text-center w-full">Año</div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-md border text-base font-medium transition-all min-w-[80px] ${selectedYear === '' ? 'bg-orange-200 border-orange-400 text-gray-900' : 'bg-white border-orange-200 text-gray-700 hover:bg-orange-100'}`}
                  onClick={() => setSelectedYear('')}
                >
                  Todos
                </button>
                {years.map(year => (
                  <button
                    key={year}
                    className={`px-4 py-2 rounded-md border text-base font-medium transition-all min-w-[80px] ${selectedYear === year ? 'bg-orange-200 border-orange-400 text-gray-900' : 'bg-white border-orange-200 text-gray-700 hover:bg-orange-100'}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
            {/* Filtro de Mes */}
            <div className="bg-white border-2 border-orange-300 rounded-lg p-4 min-w-[320px]">
              <div className="font-bold text-2xl text-orange-600 mb-3 text-center w-full">Mes</div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-md border text-base font-medium transition-all min-w-[90px] ${selectedMonth === '' ? 'bg-orange-200 border-orange-400 text-gray-900' : 'bg-white border-orange-200 text-gray-700 hover:bg-orange-100'}`}
                  onClick={() => setSelectedMonth('')}
                >
                  Todos
                </button>
                {months.map(month => (
                  <button
                    key={month.value}
                    className={`px-4 py-2 rounded-md border text-base font-medium transition-all min-w-[90px] ${selectedMonth === month.value ? 'bg-orange-200 border-orange-400 text-gray-900' : 'bg-white border-orange-200 text-gray-700 hover:bg-orange-100'}`}
                    onClick={() => setSelectedMonth(month.value)}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {filteredStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {/* Total de registros */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center"
              >
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mb-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 text-center">Total de ventas:</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{filteredStats.totalRegistros.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                </div>
              </motion.div>
              {/* Clientes totales */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center"
              >
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mb-2">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 text-center">Clientes totales:</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{filteredStats.ventasPorCliente.length}</p>
                </div>
              </motion.div>
              {/* Total general */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center"
              >
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-green-100 rounded-lg mb-2">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 text-center">Total general:</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(filteredStats.totalGeneral)}</p>
                </div>
              </motion.div>
              {/* Ticket promedio */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center"
              >
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-cyan-100 rounded-lg mb-2">
                    <Divide className="w-8 h-8 text-cyan-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 text-center">Ticket promedio:</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrencySafe(filteredStats.ticketPromedio)}</p>
                </div>
              </motion.div>
              {/* Venta máxima */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center"
              >
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mb-2">
                    <ArrowUpCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 text-center">Venta máxima:</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(filteredStats.ventaMaxima)}</p>
                  <p className="text-xs text-gray-500 mt-1">{filteredStats.clienteMayorCompra}</p>
                </div>
              </motion.div>
              {/* Venta mínima */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center"
              >
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-pink-100 rounded-lg mb-2">
                    <ArrowDownCircle className="w-8 h-8 text-pink-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 text-center">Venta mínima:</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(filteredStats.ventaMinima)}</p>
                  <p className="text-xs text-gray-500 mt-1">{filteredStats.clienteMenorCompra}</p>
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="flex flex-col gap-8">
              {/* Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-2xl font-semibold text-orange-600 mb-4 text-center w-full">
                  Ventas por Cliente
                </h3>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <div style={{ minWidth: minWidthBarChart }}>
                    <ResponsiveContainer width="100%" height={500}>
                      <BarChart data={filteredStats.ventasPorCliente} margin={{ left: 20, right: 20 }} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="cliente" 
                          angle={-35}
                          textAnchor="end"
                          height={90}
                          interval={0}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis 
                          domain={[
                            filteredStats.ventaMinima === filteredStats.ventaMaxima
                              ? 0
                              : Math.floor(filteredStats.ventaMinima),
                            Math.ceil(filteredStats.ventaMaxima)
                          ]}
                          tickFormatter={(value) => formatCurrency(value)}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Layout comparativo del mes filtrado */}
            {comparativoFiltrado && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-2xl font-semibold text-orange-600 mb-4 text-center w-full">Comparativo del Mes Filtrado</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Mes/Año</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Mes Actual</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Mes Anterior</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Diferencia</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">% Diferencia</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900 font-semibold">{getMonthName(comparativoFiltrado.month)} {comparativoFiltrado.year}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(comparativoFiltrado.ventasActual)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{comparativoFiltrado.ventasAnterior !== null ? formatCurrency(comparativoFiltrado.ventasAnterior) : '--'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{comparativoFiltrado.diferencia !== null ? formatCurrency(comparativoFiltrado.diferencia) : '--'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{comparativoFiltrado.porcentaje !== null ? comparativoFiltrado.porcentaje.toFixed(1) + '%' : '--'}</td>
                      </tr>
                    </tbody>
                  </table>
                  {/* Mensaje especial para enero filtrado */}
                  {(comparativoFiltrado.month === '01' || comparativoFiltrado.month === '1') && (
                    <div className="mt-4 text-center text-orange-700 font-medium">
                      El mes de enero de {comparativoFiltrado.year} no se puede comparar ya que no tienes información del año inmediato anterior.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Layout comparativo anual */}
            {comparativoAnual.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Mes/Año</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Mes Actual</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Mes Anterior</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Diferencia</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">% Diferencia</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {comparativoAnual.map((row, idx) => (
                        <tr key={row.year + row.month} className={idx % 2 === 0 ? 'bg-white' : 'bg-gold-50'}>
                          <td className="px-4 py-2 text-sm text-gray-900 font-semibold">{getMonthName(row.month)} {row.year}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(row.ventasActual)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{row.ventasAnterior !== null ? formatCurrency(row.ventasAnterior) : '--'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{row.diferencia !== null ? formatCurrency(row.diferencia) : '--'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{row.porcentaje !== null ? row.porcentaje.toFixed(1) + '%' : '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Mensaje especial para enero */}
                  {comparativoAnual.some(row => (row.month === '01' || row.month === '1')) && (
                    <div className="mt-4 text-center text-orange-700 font-medium">
                      {comparativoAnual.filter(row => row.month === '01' || row.month === '1').map(row => (
                        <div key={row.year}>El mes de enero de {row.year} no se puede comparar ya que no tienes información del año inmediato anterior.</div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Gráfica de variación porcentual restaurada */}
                <div className="w-full flex justify-center mt-8">
                  <ResponsiveContainer width={600} height={320}>
                    <BarChart data={comparativoAnual.filter(row => row.porcentaje !== null)} margin={{ left: 40, right: 40, top: 20, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={row => `${getMonthName(row.month)} ${row.year}`} tick={{ fontSize: 12 }} angle={-35} textAnchor="end" height={70} interval={0} />
                      <YAxis tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fontSize: 12 }} width={50} />
                      <Tooltip formatter={v => `${v.toFixed(1)}%`} labelFormatter={(_, payload) => payload && payload[0] ? `${getMonthName(payload[0].payload.month)} ${payload[0].payload.year}` : ''} />
                      <Bar dataKey="porcentaje">
                        {comparativoAnual.filter(row => row.porcentaje !== null).map((row, idx) => (
                          <Cell key={idx} fill={row.porcentaje! >= 0 ? '#22c55e' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Detalle de Ventas por Cliente Mejorado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-lg p-6 mt-8"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <h3 className="text-2xl font-semibold text-orange-600 text-center w-full -mt-2">
                  Detalle de Ventas por Cliente
                </h3>
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-64"
                />
                {/* Botón exportar (placeholder) */}
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm shadow">
                  Exportar a Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortBy('cliente'); setSortDir(sortBy === 'cliente' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Cliente</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortBy('total'); setSortDir(sortBy === 'total' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Total de Ventas</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">% del Total</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortBy('frecuencia'); setSortDir(sortBy === 'frecuencia' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Frecuencia</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortBy('ultimaCompra'); setSortDir(sortBy === 'ultimaCompra' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Última Compra</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortBy('ticketPromedio'); setSortDir(sortBy === 'ticketPromedio' && sortDir === 'asc' ? 'desc' : 'asc'); }}>Ticket Promedio</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">VIP</th>
                      {mesesDelAnio.map(mes => (
                        <th key={mes} className="px-2 py-2 text-xs font-medium text-blue-700 uppercase tracking-wider">{getMonthName(mes)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientesPagina.map((item, index) => (
                      <tr
                        key={item.cliente}
                        className={
                          `${index % 2 === 0 ? 'bg-white' : 'bg-gold-50'} hover:bg-gold-100` +
                          (index < 3 ? ' font-bold' : '')
                        }
                      >
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 font-semibold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                          {item.cliente}
                          {index === 0 && <span className="ml-1 px-2 py-0.5 bg-yellow-300 text-yellow-900 rounded text-xs font-bold">VIP</span>}
                          {index < 3 && <span className="ml-1 px-2 py-0.5 bg-orange-200 text-orange-800 rounded text-xs">Top {index + 1}</span>}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.total)}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">{((item.total / filteredStats.totalGeneral) * 100).toFixed(1)}%</td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{item.frecuencia}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{item.ultimaCompra}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.ticketPromedio)}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-center">
                          {index === 0 ? '⭐' : ''}
                        </td>
                        {mesesDelAnio.map(mes => (
                          <td key={mes} className="px-2 py-2 whitespace-nowrap text-sm text-blue-900 text-right">
                            {formatCurrency(item.ventasPorMes?.[mes] || 0)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Paginación */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Anterior</button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Siguiente</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Agregar el botón arriba del dashboard */}
        {allSales.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleDownloadExecutivePDF}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-all text-lg"
            >
              Descargar Resumen Ejecutivo PDF
            </button>
          </div>
        )}

        {/* Gráfica oculta para PDF */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div className="pdf-bar-chart">
            <ResponsiveContainer width={600} height={300}>
              <BarChart data={filteredStats?.ventasPorCliente.slice(0, 10) || []} margin={{ left: 20, right: 20 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="cliente" 
                  angle={-35}
                  textAnchor="end"
                  height={90}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  domain={[
                    filteredStats?.ventaMinima === filteredStats?.ventaMaxima
                      ? 0
                      : Math.floor(filteredStats?.ventaMinima || 0),
                    Math.ceil(filteredStats?.ventaMaxima || 0)
                  ]}
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 