import { DashboardStats } from './excel-processor';

export const sampleData: DashboardStats = {
  totalRegistros: 5,
  totalGeneral: 4283.99,
  publicoEnGeneral: 539.99,
  ventasPorCliente: [
    {
      cliente: "GUDELIA LUCAS",
      total: 1780.00
    },
    {
      cliente: "DON GERARDO",
      total: 1964.00
    },
    {
      cliente: "Público en General",
      total: 539.99
    }
  ],
  ticketPromedio: 856.80,
  ventaMaxima: 1964.00,
  ventaMinima: 539.99,
  clienteMayorCompra: "DON GERARDO",
  clienteMenorCompra: "Público en General"
};

export const sampleSalesData = [
  {
    documento: "Ticket",
    fecha: "16/06/2025",
    folio: 31302,
    cliente: "Público en General",
    caja: "Caja 1",
    usuario: "admin",
    est: "V",
    total: 49.99
  },
  {
    documento: "Ticket",
    fecha: "16/06/2025",
    folio: 31329,
    cliente: "GUDELIA LUCAS",
    caja: "Caja 1",
    usuario: "admin",
    est: "V",
    total: 1780.00
  },
  {
    documento: "Ticket",
    fecha: "16/06/2025",
    folio: 31247,
    cliente: "Público en General",
    caja: "Caja 1",
    usuario: "admin",
    est: "V",
    total: 290.00
  },
  {
    documento: "Ticket",
    fecha: "16/06/2025",
    folio: 31248,
    cliente: "DON GERARDO",
    caja: "Caja 1",
    usuario: "admin",
    est: "V",
    total: 1964.00
  },
  {
    documento: "Ticket",
    fecha: "16/06/2025",
    folio: 31249,
    cliente: "Público en General",
    caja: "Caja 1",
    usuario: "admin",
    est: "V",
    total: 200.00
  }
]; 