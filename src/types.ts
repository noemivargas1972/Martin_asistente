export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  updatedAt: string;
  content: string;
  isImage?: boolean;
  includedInMartin?: boolean;
}

export interface DataRow {
  fecha: string;
  nombre: string;
  tipo: string;
  link: string;
  size: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  image?: string; // base64 representation if sent
  isReport?: boolean;
}

export interface DashboardStats {
  ventasDia: number;
  gananciaDia: number;
  margen: number;
  ticketPromedio: number;
  productosVendidos: number;
  ventasDiaDiff: number;
  gananciaDiaDiff: number;
  margenDiff: number;
  ticketPromedioDiff: number;
  productosVendidosDiff: number;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: "cumpleaños" | "medico" | "empresario" | "otro";
  description?: string;
}

export type UserRole = "owner" | "deposito" | "supervisor_golosinas" | "supervisor_bebidas" | "supervisor_elaborados" | "analista" | "desarrollador" | "auditor" | "operario" | "empleado";

export interface AuthorizedUser {
  email: string;
  role: UserRole;
  name: string;
  customCode?: string; // Quick passcode for this user
  addedAt?: string;
  authorizedBy?: string;
}

export interface StockActualRow {
  producto: string;
  cantidad: number;
  local: string;
  ultimaActualizacion: string;
  estado?: "OK" | "CRITICO" | "EXCESO" | "SIN_STOCK";
}

export interface HistorialMovimientoRow {
  id: string;
  fechaHora: string;
  producto: string;
  local: string;
  tipoMovimiento: "NORMALIZACION" | "ENTRADA" | "SALIDA" | "AJUSTE" | "BALANCEO" | "TRASLADO";
  cantidadVariacion: number;
  stockAnterior: number;
  stockResultante: number;
  usuarioOrigen: string;
  observacion?: string;
}

export interface RemitoItem {
  producto: string;
  cantidad: number;
}

export interface RemitoLogistico {
  id: string;
  numeroRemito: string;
  fecha: string;
  origen: string;
  destino: string;
  items: RemitoItem[];
  estado: "GENERADO" | "EN_TRANSITO" | "ENTREGADO";
  linkPublicoExcel?: string;
  linkPublicoPdf?: string;
  hashVerificacion?: string;
}

export interface InventarioStatusResult {
  estado: "Inventario Procesado" | "El archivo está corrupto" | "Error";
  nombreArchivo: string;
  productosDetectados: number;
  totalUnidades: number;
  localesDetectados: string[];
  detalles: StockActualRow[];
  timestamp: string;
}

export interface ProspectLead {
  id: string;
  name: string;
  category: string;
  phone: string;
  location?: string;
  website?: string;
  websiteOrIg?: string;
  status: "nuevo" | "llamado" | "contactado_llamada" | "whatsapp_enviado" | "cita_agendada" | "interesado" | "no_interesado" | "info_completa_enviada";
  estimatedVolume?: string;
  painPoint?: string;
  callPitch?: string;
  suggestedPitch?: string;
  whatsappMessage?: string;
  lastContactDate?: string;
  notes?: string;
  clientResponseNote?: string;
  hasReceivedCompleteInfo?: boolean;
}

export interface AppointmentSchedule {
  id: string;
  prospectId?: string;
  prospectName: string;
  phone: string;
  date: string;
  time?: string;
  service: string;
  notes: string;
  status?: "agendada" | "completada" | "cancelada";
}

export type CommunicationMode = "llamada_ia" | "whatsapp_directo" | "omnicanal";
export type SalesStrategy = "cierre_agresivo" | "consultivo_puntos" | "express_flex";

export interface CustomSalesSpeechConfig {
  communicationMode: CommunicationMode;
  salesStrategy: SalesStrategy;
  aiPersonalizationEnabled: boolean;
  autoVoiceEnabled: boolean;
  whatsappSpeechTemplate: string;
  callOpeningSpeechTemplate: string;
  replyFollowupSpeechTemplate: string;
}

export interface BranchOrderItem {
  id: string;
  product: string;
  category: "Bebidas Alcohólicas" | "Gaseosas & Aguas" | "Golosinas & Snacks" | "Almacén" | "Limpieza & Varios";
  quantityRequested: number;
  stockAvailableInDepot: number;
  isAvailable: boolean;
  unitCost: number;
  unitDispatchPrice: number;
  subtotal: number;
  missingUnits: number;
}

export interface BranchOrderQuotation {
  id: string;
  branchName: string;
  branchPhone?: string;
  createdAt: string;
  rawPastedText: string;
  availableItems: BranchOrderItem[];
  missingItems: BranchOrderItem[];
  totalAvailableUnits: number;
  totalMissingUnits: number;
  totalQuotationARS: number;
  totalCostARS: number;
  status: "borrador" | "presupuestado" | "despachado_deposito" | "entregado";
}

export interface ConsolidatedMissingProduct {
  product: string;
  category: string;
  totalUnitsNeeded: number;
  requestedByBranches: Array<{
    branchName: string;
    units: number;
  }>;
  estimatedSupplierUnitCost: number;
  estimatedTotalPurchaseARS: number;
}

export type AppActiveModule = "modulo1_servicios_tech" | "modulo2_gestion_sucursales";

export type MartinContextRole = "modulo1_servicios_tech" | "modulo2_gestion_sucursales" | "auto" | "the_best_finance" | "buenos_aires_flex" | "marketing_prospecting";




