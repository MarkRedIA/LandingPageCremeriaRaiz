import * as XLSX from 'xlsx';

export interface SaleRecord {
  documento: string;
  fecha: string;
  folio: number;
  cliente: string;
  caja: string;
  usuario: string;
  est: string;
  total: number;
}

export interface DashboardStats {
  totalRegistros: number;
  totalGeneral: number;
  publicoEnGeneral: number;
  ventasPorCliente: { cliente: string; total: number }[];
  ticketPromedio: number;
  ventaMaxima: number;
  ventaMinima: number;
  clienteMayorCompra: string;
  clienteMenorCompra: string;
}

export function processExcelData(file: File): Promise<DashboardStats> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Obtener la hoja GeneralV
        const worksheet = workbook.Sheets['GeneralV'];
        if (!worksheet) {
          throw new Error('No se encontró la hoja GeneralV');
        }
        
        // Convertir a JSON, empezando desde la fila 7 (índice 6)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          range: 6 // Empezar desde la fila 7 (índice 6)
        });
        
        const salesData: SaleRecord[] = [];
        let totalGeneral = 0;
        let publicoEnGeneral = 0;
        const clientTotals: { [key: string]: number } = {};
        
        // Procesar cada fila de datos
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          // Verificar si llegamos al final (buscar "Total venta:")
          if (row[0] && typeof row[0] === 'string' && row[0].includes('Total venta:')) {
            break;
          }
          
          // Verificar que la fila tenga datos válidos
          if (row[0] && row[2] && row[4] && row[6] && row[11] && row[16] && row[24] && row[28]) {
            // Extraer el valor numérico del total (eliminar símbolo de peso y comas)
            let totalValue = 0;
            if (row[28]) {
              const totalStr = String(row[28]).replace(/[$,]/g, '').trim();
              totalValue = parseFloat(totalStr) || 0;
            }
            
            const saleRecord: SaleRecord = {
              documento: String(row[0] || '').trim(),
              fecha: String(row[2] || '').trim(),
              folio: parseInt(String(row[4] || '0')) || 0,
              cliente: String(row[6] || '').trim(),
              caja: String(row[11] || '').trim(),
              usuario: String(row[16] || '').trim(),
              est: String(row[24] || '').trim(),
              total: totalValue
            };
            
            salesData.push(saleRecord);
            totalGeneral += totalValue;
            
            // Acumular total por cliente
            if (clientTotals[saleRecord.cliente]) {
              clientTotals[saleRecord.cliente] += totalValue;
            } else {
              clientTotals[saleRecord.cliente] = totalValue;
            }
            
            // Acumular total para "Público en General"
            if (saleRecord.cliente.toLowerCase().includes('público en general')) {
              publicoEnGeneral += totalValue;
            }
          }
        }
        
        // Convertir el objeto de totales por cliente a array
        const ventasPorCliente = Object.entries(clientTotals)
          .map(([cliente, total]) => ({ cliente, total }))
          .sort((a, b) => b.total - a.total);
        
        // Calcular métricas adicionales
        const ticketPromedio = salesData.length > 0 ? totalGeneral / salesData.length : 0;
        const ventaMaxima = ventasPorCliente.length > 0 ? ventasPorCliente[0].total : 0;
        const ventaMinima = ventasPorCliente.length > 0 ? ventasPorCliente[ventasPorCliente.length - 1].total : 0;
        const clienteMayorCompra = ventasPorCliente.length > 0 ? ventasPorCliente[0].cliente : '';
        const clienteMenorCompra = ventasPorCliente.length > 0 ? ventasPorCliente[ventasPorCliente.length - 1].cliente : '';
        
        const stats: DashboardStats = {
          totalRegistros: salesData.length,
          totalGeneral,
          publicoEnGeneral,
          ventasPorCliente,
          ticketPromedio,
          ventaMaxima,
          ventaMinima,
          clienteMayorCompra,
          clienteMenorCompra
        };
        
        resolve(stats);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
} 