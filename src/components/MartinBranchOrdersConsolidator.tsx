import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileSpreadsheet,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Layers,
  ArrowRight,
  Clipboard,
  Download,
  MessageSquare,
  DollarSign,
  Calculator,
  ShieldCheck,
  Send,
  Boxes,
  Store,
  Warehouse,
  TrendingDown,
  ArrowRightLeft,
  Search,
  Filter,
  CheckSquare,
  Square,
  HelpCircle,
  Clock,
  Flame,
  FileText
} from "lucide-react";
import * as XLSX from "xlsx";
import { speakMartin } from "../lib/maleVoicePicker";
import { sendWhatsAppMessage } from "../lib/whatsappSender";
import { MASTER_38_BRANCHES, BranchInfo, TOTAL_NETWORK_BRANCHES } from "../data/branchesData";
import { BranchOrderItem, BranchOrderQuotation, ConsolidatedMissingProduct } from "../types";

interface MartinBranchOrdersConsolidatorProps {
  userDisplayName?: string;
  onOpenChatWithMartin?: (prompt?: string) => void;
}

// 🏢 SUPPLIERS & THEIR COMPLETE PRODUCT LINES
export interface SupplierProduct {
  id: string;
  name: string;
  category: string;
  supplier: string;
  unitCost: number; // Costo de remito de compra
  unitDispatchPrice: number; // Precio de despacho a sucursal
  depotStock: number; // Stock actual en depósito central
  avgLocalStock: number; // Stock promedio actual por local
  targetPerLocal: number; // Objetivo por local (Heladera + Góndola = 12 + 24 = 36)
  coolerTarget: number; // Unidades en heladera
  shelfTarget: number; // Unidades en góndola
  packageType: string; // Botellas, latas, cajas, etc.
}

export interface SupplierDefinition {
  id: string;
  name: string;
  company: string;
  contactPhone: string;
  deliveryDays: string;
  repFrequency: string; // "2 veces por semana"
  products: SupplierProduct[];
}

export const MASTER_SUPPLIERS: SupplierDefinition[] = [
  {
    id: "coca-cola",
    name: "Coca-Cola FEMSA / Andina",
    company: "Coca-Cola FEMSA Argentina",
    contactPhone: "+54 9 11 5555-0101",
    deliveryDays: "Martes y Jueves",
    repFrequency: "2 veces por semana (Cobertura 1.5 a 2 semanas)",
    products: [
      { id: "coca-15", name: "Coca-Cola 1.5L Descartable", category: "Gaseosas", supplier: "Coca-Cola FEMSA", unitCost: 1400, unitDispatchPrice: 1850, depotStock: 280, avgLocalStock: 8, targetPerLocal: 36, coolerTarget: 12, shelfTarget: 24, packageType: "Unidades" },
      { id: "coca-225", name: "Coca-Cola 2.25L Descartable", category: "Gaseosas", supplier: "Coca-Cola FEMSA", unitCost: 1900, unitDispatchPrice: 2500, depotStock: 180, avgLocalStock: 6, targetPerLocal: 36, coolerTarget: 12, shelfTarget: 24, packageType: "Unidades" },
      { id: "coca-500", name: "Coca-Cola 500ml Pet", category: "Gaseosas", supplier: "Coca-Cola FEMSA", unitCost: 850, unitDispatchPrice: 1200, depotStock: 150, avgLocalStock: 14, targetPerLocal: 48, coolerTarget: 24, shelfTarget: 24, packageType: "Unidades" },
      { id: "coca-zero-15", name: "Coca-Cola Zero 1.5L", category: "Gaseosas", supplier: "Coca-Cola FEMSA", unitCost: 1400, unitDispatchPrice: 1850, depotStock: 90, avgLocalStock: 5, targetPerLocal: 24, coolerTarget: 8, shelfTarget: 16, packageType: "Unidades" },
      { id: "sprite-15", name: "Sprite 1.5L Descartable", category: "Gaseosas", supplier: "Coca-Cola FEMSA", unitCost: 1350, unitDispatchPrice: 1800, depotStock: 120, avgLocalStock: 7, targetPerLocal: 24, coolerTarget: 8, shelfTarget: 16, packageType: "Unidades" },
      { id: "fanta-15", name: "Fanta Naranja 1.5L", category: "Gaseosas", supplier: "Coca-Cola FEMSA", unitCost: 1350, unitDispatchPrice: 1800, depotStock: 110, avgLocalStock: 6, targetPerLocal: 24, coolerTarget: 8, shelfTarget: 16, packageType: "Unidades" },
      { id: "monster-473", name: "Monster Energy 473ml Lata", category: "Energizantes", supplier: "Coca-Cola FEMSA", unitCost: 1600, unitDispatchPrice: 2200, depotStock: 40, avgLocalStock: 4, targetPerLocal: 36, coolerTarget: 18, shelfTarget: 18, packageType: "Latas" },
      { id: "powerade-500", name: "Powerade Mountain Berry 500ml", category: "Isotónicas", supplier: "Coca-Cola FEMSA", unitCost: 950, unitDispatchPrice: 1350, depotStock: 70, avgLocalStock: 6, targetPerLocal: 24, coolerTarget: 12, shelfTarget: 12, packageType: "Botellas" },
      { id: "cepita-1l", name: "Cepita Del Valle Naranja 1L", category: "Jugos", supplier: "Coca-Cola FEMSA", unitCost: 900, unitDispatchPrice: 1300, depotStock: 85, avgLocalStock: 5, targetPerLocal: 20, coolerTarget: 8, shelfTarget: 12, packageType: "Unidades" },
      { id: "schweppes-15", name: "Schweppes Tónica 1.5L", category: "Gaseosas", supplier: "Coca-Cola FEMSA", unitCost: 1400, unitDispatchPrice: 1900, depotStock: 65, avgLocalStock: 5, targetPerLocal: 20, coolerTarget: 8, shelfTarget: 12, packageType: "Unidades" }
    ]
  },
  {
    id: "quilmes-abinbev",
    name: "Cervecería Quilmes / AB InBev",
    company: "Cervecería y Maltería Quilmes",
    contactPhone: "+54 9 11 5555-0202",
    deliveryDays: "Miércoles y Viernes",
    repFrequency: "2 veces por semana",
    products: [
      { id: "quilmes-473", name: "Cerveza Quilmes 473ml Lata", category: "Cervezas", supplier: "Quilmes / AB InBev", unitCost: 1100, unitDispatchPrice: 1500, depotStock: 320, avgLocalStock: 16, targetPerLocal: 48, coolerTarget: 24, shelfTarget: 24, packageType: "Latas" },
      { id: "corona-330", name: "Cerveza Corona 330ml Porrón", category: "Cervezas", supplier: "Quilmes / AB InBev", unitCost: 1600, unitDispatchPrice: 2200, depotStock: 210, avgLocalStock: 10, targetPerLocal: 36, coolerTarget: 18, shelfTarget: 18, packageType: "Porrones" },
      { id: "stella-473", name: "Cerveza Stella Artois 473ml Lata", category: "Cervezas", supplier: "Quilmes / AB InBev", unitCost: 1550, unitDispatchPrice: 2100, depotStock: 160, avgLocalStock: 9, targetPerLocal: 36, coolerTarget: 18, shelfTarget: 18, packageType: "Latas" },
      { id: "patagonia-ipa", name: "Cerveza Patagonia 26.9 IPA 473ml", category: "Cervezas", supplier: "Quilmes / AB InBev", unitCost: 1900, unitDispatchPrice: 2600, depotStock: 90, avgLocalStock: 6, targetPerLocal: 24, coolerTarget: 12, shelfTarget: 12, packageType: "Latas" },
      { id: "andes-origen", name: "Cerveza Andes Origen Rubia 473ml", category: "Cervezas", supplier: "Quilmes / AB InBev", unitCost: 1350, unitDispatchPrice: 1850, depotStock: 130, avgLocalStock: 8, targetPerLocal: 24, coolerTarget: 12, shelfTarget: 12, packageType: "Latas" },
      { id: "gatorade-500", name: "Gatorade Cool Blue 500ml", category: "Isotónicas", supplier: "Quilmes / AB InBev", unitCost: 980, unitDispatchPrice: 1400, depotStock: 80, avgLocalStock: 7, targetPerLocal: 24, coolerTarget: 12, shelfTarget: 12, packageType: "Botellas" },
      { id: "paso-toros-15", name: "Paso de los Toros Tónica 1.5L", category: "Gaseosas", supplier: "Quilmes / AB InBev", unitCost: 1300, unitDispatchPrice: 1750, depotStock: 95, avgLocalStock: 6, targetPerLocal: 24, coolerTarget: 8, shelfTarget: 16, packageType: "Unidades" }
    ]
  },
  {
    id: "arcor-bagley",
    name: "Arcor / Bagley Alimentos",
    company: "Grupo Arcor S.A.I.C.",
    contactPhone: "+54 9 11 5555-0303",
    deliveryDays: "Lunes y Jueves",
    repFrequency: "2 veces por semana",
    products: [
      { id: "block-170", name: "Chocolate Block 170g", category: "Chocolates", supplier: "Arcor", unitCost: 2200, unitDispatchPrice: 3100, depotStock: 60, avgLocalStock: 5, targetPerLocal: 24, coolerTarget: 0, shelfTarget: 24, packageType: "Unidades" },
      { id: "bon-o-bon-30", name: "Bon o Bon Leche (Caja x30)", category: "Chocolates", supplier: "Arcor", unitCost: 7800, unitDispatchPrice: 10500, depotStock: 45, avgLocalStock: 2, targetPerLocal: 6, coolerTarget: 0, shelfTarget: 6, packageType: "Cajas" },
      { id: "mogul-150", name: "Mogul Gomitas Frutales 150g", category: "Golosinas", supplier: "Arcor", unitCost: 950, unitDispatchPrice: 1400, depotStock: 90, avgLocalStock: 8, targetPerLocal: 30, coolerTarget: 0, shelfTarget: 30, packageType: "Packs" },
      { id: "chocolinas-250", name: "Galletitas Chocolinas 250g", category: "Galletitas", supplier: "Arcor / Bagley", unitCost: 1300, unitDispatchPrice: 1850, depotStock: 85, avgLocalStock: 7, targetPerLocal: 24, coolerTarget: 0, shelfTarget: 24, packageType: "Paquetes" },
      { id: "turron-arcor", name: "Turrón de Maní Arcor (Caja x50)", category: "Golosinas", supplier: "Arcor", unitCost: 6500, unitDispatchPrice: 8900, depotStock: 40, avgLocalStock: 2, targetPerLocal: 5, coolerTarget: 0, shelfTarget: 5, packageType: "Cajas" },
      { id: "cerealitas-200", name: "Galletitas Cerealitas Clásicas 200g", category: "Galletitas", supplier: "Arcor / Bagley", unitCost: 1150, unitDispatchPrice: 1650, depotStock: 70, avgLocalStock: 6, targetPerLocal: 20, coolerTarget: 0, shelfTarget: 20, packageType: "Paquetes" }
    ]
  },
  {
    id: "mondelez-terrabusi",
    name: "Mondelez / Terrabusi",
    company: "Mondelez International Argentina",
    contactPhone: "+54 9 11 5555-0404",
    deliveryDays: "Martes y Viernes",
    repFrequency: "2 veces por semana",
    products: [
      { id: "terrabusi-alfajor", name: "Alfajor Terrabusi Chocolate (Caja x40)", category: "Alfajores", supplier: "Mondelez", unitCost: 12500, unitDispatchPrice: 16800, depotStock: 35, avgLocalStock: 2, targetPerLocal: 6, coolerTarget: 0, shelfTarget: 6, packageType: "Cajas" },
      { id: "oreo-118", name: "Galletitas Oreo Original 118g", category: "Galletitas", supplier: "Mondelez", unitCost: 1100, unitDispatchPrice: 1600, depotStock: 110, avgLocalStock: 9, targetPerLocal: 36, coolerTarget: 0, shelfTarget: 36, packageType: "Paquetes" },
      { id: "pepitos-119", name: "Galletitas Pepitos con Chips 119g", category: "Galletitas", supplier: "Mondelez", unitCost: 1050, unitDispatchPrice: 1550, depotStock: 95, avgLocalStock: 8, targetPerLocal: 30, coolerTarget: 0, shelfTarget: 30, packageType: "Paquetes" },
      { id: "beldent-menta", name: "Chicle Beldent Menta (Caja x20)", category: "Golosinas", supplier: "Mondelez", unitCost: 7200, unitDispatchPrice: 9800, depotStock: 50, avgLocalStock: 3, targetPerLocal: 8, coolerTarget: 0, shelfTarget: 8, packageType: "Cajas" },
      { id: "milka-mousse", name: "Chocolate Milka Mousse 150g", category: "Chocolates", supplier: "Mondelez", unitCost: 2600, unitDispatchPrice: 3600, depotStock: 40, avgLocalStock: 4, targetPerLocal: 18, coolerTarget: 0, shelfTarget: 18, packageType: "Unidades" }
    ]
  },
  {
    id: "ccu-destilados",
    name: "Distribuidora Mayorista de Bebidas & Destilados",
    company: "Distribuidora Central Spirits & Beers",
    contactPhone: "+54 9 11 5555-0505",
    deliveryDays: "Lunes, Miércoles y Viernes",
    repFrequency: "3 veces por semana",
    products: [
      { id: "fernet-branca", name: "Fernet Branca 750ml", category: "Bebidas Alcohólicas", supplier: "Fratelli Branca / Mayorista", unitCost: 8200, unitDispatchPrice: 10500, depotStock: 140, avgLocalStock: 6, targetPerLocal: 24, coolerTarget: 8, shelfTarget: 16, packageType: "Botellas" },
      { id: "heineken-473", name: "Cerveza Heineken 473ml Lata", category: "Bebidas Alcohólicas", supplier: "CCU", unitCost: 1450, unitDispatchPrice: 1950, depotStock: 220, avgLocalStock: 12, targetPerLocal: 36, coolerTarget: 18, shelfTarget: 18, packageType: "Latas" },
      { id: "smirnoff-700", name: "Vodka Smirnoff 700ml", category: "Bebidas Alcohólicas", supplier: "Diageo / Mayorista", unitCost: 4900, unitDispatchPrice: 6500, depotStock: 80, avgLocalStock: 5, targetPerLocal: 18, coolerTarget: 6, shelfTarget: 12, packageType: "Botellas" },
      { id: "absolut-700", name: "Vodka Absolut 700ml", category: "Bebidas Alcohólicas", supplier: "Pernod Ricard", unitCost: 11500, unitDispatchPrice: 14800, depotStock: 25, avgLocalStock: 2, targetPerLocal: 8, coolerTarget: 2, shelfTarget: 6, packageType: "Botellas" },
      { id: "beefeater-700", name: "Gin Beefeater 700ml", category: "Bebidas Alcohólicas", supplier: "Pernod Ricard", unitCost: 10800, unitDispatchPrice: 13900, depotStock: 10, avgLocalStock: 2, targetPerLocal: 8, coolerTarget: 2, shelfTarget: 6, packageType: "Botellas" },
      { id: "aperol-750", name: "Aperol Spritz 750ml", category: "Bebidas Alcohólicas", supplier: "Campari Group", unitCost: 5200, unitDispatchPrice: 6900, depotStock: 55, avgLocalStock: 4, targetPerLocal: 12, coolerTarget: 4, shelfTarget: 8, packageType: "Botellas" },
      { id: "campari-750", name: "Campari Bitter 750ml", category: "Bebidas Alcohólicas", supplier: "Campari Group", unitCost: 5800, unitDispatchPrice: 7600, depotStock: 45, avgLocalStock: 4, targetPerLocal: 12, coolerTarget: 4, shelfTarget: 8, packageType: "Botellas" },
      { id: "rutini-malbec", name: "Vino Rutini Malbec 750ml", category: "Vinos", supplier: "La Rural / Rutini Wines", unitCost: 12900, unitDispatchPrice: 16500, depotStock: 30, avgLocalStock: 3, targetPerLocal: 10, coolerTarget: 0, shelfTarget: 10, packageType: "Botellas" },
      { id: "johnnie-black", name: "Whisky Johnnie Walker Black 750ml", category: "Bebidas Alcohólicas", supplier: "Diageo", unitCost: 29000, unitDispatchPrice: 36000, depotStock: 8, avgLocalStock: 1, targetPerLocal: 4, coolerTarget: 0, shelfTarget: 4, packageType: "Botellas" }
    ]
  },
  {
    id: "aguas-hielo",
    name: "Aguas Danone & Hielo Rolito",
    company: "Aguas Danone de Argentina / Rolito",
    contactPhone: "+54 9 11 5555-0606",
    deliveryDays: "Lunes a Viernes (Diario)",
    repFrequency: "Diario / A demanda climática",
    products: [
      { id: "villavicencio-15", name: "Agua Villavicencio 1.5L Sin Gas", category: "Aguas", supplier: "Danone", unitCost: 750, unitDispatchPrice: 1100, depotStock: 190, avgLocalStock: 14, targetPerLocal: 48, coolerTarget: 24, shelfTarget: 24, packageType: "Unidades" },
      { id: "villa-sur-15", name: "Agua Villa del Sur 1.5L Con Gas", category: "Aguas", supplier: "Danone", unitCost: 720, unitDispatchPrice: 1050, depotStock: 140, avgLocalStock: 10, targetPerLocal: 36, coolerTarget: 18, shelfTarget: 18, packageType: "Unidades" },
      { id: "hielo-rolito-4kg", name: "Bolsa de Hielo Rolito 4kg", category: "Hielo", supplier: "Rolito", unitCost: 1200, unitDispatchPrice: 1800, depotStock: 95, avgLocalStock: 8, targetPerLocal: 20, coolerTarget: 20, shelfTarget: 0, packageType: "Bolsas" }
    ]
  }
];

export const MartinBranchOrdersConsolidator: React.FC<MartinBranchOrdersConsolidatorProps> = ({
  userDisplayName = "Noemí Carvallo",
  onOpenChatWithMartin
}) => {
  // Navigation Tabs inside this module
  const [activeSubTab, setActiveSubTab] = useState<"supplier_lines" | "branch_directives" | "multi_group_missing">("supplier_lines");

  // 1. Supplier Line Audit & Purchase Engine
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("coca-cola");
  const [coverageMultiplier, setCoverageMultiplier] = useState<number>(3); // 3x reposición (1.5 a 2 semanas con 2 repartos/sem)
  const [coolerParam, setCoolerParam] = useState<number>(12); // Default 12 u en heladera
  const [shelfParam, setShelfParam] = useState<number>(24); // Default 24 u en góndola
  const [isAuditingDrive, setIsAuditingDrive] = useState<boolean>(false);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>("TODAS");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Step 1 Directives for WhatsApp groups
  const [selectedBranchForDirective, setSelectedBranchForDirective] = useState("Todos los Grupos (38 Sucursales)");
  const [directiveCategory, setDirectiveCategory] = useState<"coca_cola" | "bebidas" | "kiosco" | "gaseosas" | "general">("coca_cola");
  const [copiedDirective, setCopiedDirective] = useState(false);

  // Step 2 Response parsing state
  const [selectedBranchForResponse, setSelectedBranchForResponse] = useState(MASTER_38_BRANCHES[1].name);
  const [pastedGroupResponse, setPastedGroupResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Quotations and Orders state
  const [quotations, setQuotations] = useState<BranchOrderQuotation[]>(() => {
    try {
      const saved = localStorage.getItem("martin_branch_quotations_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [activeQuotationId, setActiveQuotationId] = useState<string | null>(null);

  // Save quotations to localStorage
  const saveQuotations = (updated: BranchOrderQuotation[]) => {
    setQuotations(updated);
    try {
      localStorage.setItem("martin_branch_quotations_v2", JSON.stringify(updated));
    } catch (e) {}
  };

  const formatARS = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Selected Supplier object
  const activeSupplier = useMemo(() => {
    return MASTER_SUPPLIERS.find(s => s.id === selectedSupplierId) || MASTER_SUPPLIERS[0];
  }, [selectedSupplierId]);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    if (selectedZoneFilter === "TODAS") return MASTER_38_BRANCHES;
    return MASTER_38_BRANCHES.filter(b => b.zone === selectedZoneFilter);
  }, [selectedZoneFilter]);

  // 🧮 INTELLIGENT AUDIT & CALCULATION FOR SELECTED SUPPLIER'S LINE
  // Formula:
  // - Target per local = coolerParam + shelfParam (or product-specific adjusted)
  // - Total Network Target = Target per local * 38 locales
  // - Total Coverage Target (1.5-2 weeks = 3x reposiciones) = (Target per local * 38) * coverageMultiplier
  // - Current Chain Stock = Depot Stock + (Avg Local Stock * 38)
  // - Balance Diagnosis:
  //   * If Current Chain Stock >= Total Coverage Target: "Mala distribución interna -> Balanceo / Traslados"
  //   * If Current Chain Stock < Total Coverage Target: "Bajo Stock Real -> Pedido a Proveedor"
  const supplierAuditAnalysis = useMemo(() => {
    const totalBranchesCount = TOTAL_NETWORK_BRANCHES; // 38

    return activeSupplier.products.map(product => {
      const targetPerLocal = (product.coolerTarget > 0 ? coolerParam : 0) + (product.shelfTarget > 0 ? shelfParam : product.targetPerLocal);
      const totalLocalesStock = product.avgLocalStock * totalBranchesCount;
      const totalChainStock = product.depotStock + totalLocalesStock;
      
      // Objective for the 38 branches with coverage buffer (3x cycles)
      const idealCoverageTarget = (targetPerLocal * totalBranchesCount) * (coverageMultiplier / 2); // 3x standard coverage
      const missingToOrder = Math.max(0, idealCoverageTarget - totalChainStock);
      const totalPurchaseEstimatedARS = missingToOrder * product.unitCost;

      // Smart Verdict
      let verdict: "REDISTRIBUCION" | "COMPRA_URGENTE" | "STOCK_OPTIMO" = "STOCK_OPTIMO";
      let verdictDetail = "";

      if (totalChainStock >= idealCoverageTarget) {
        verdict = "REDISTRIBUCION";
        verdictDetail = "Stock suficiente en la cadena. Hay mercadería en depósito o locales con sobre-stock. Recomiendo balanceo entre sucursales.";
      } else if (product.depotStock < 100 && totalLocalesStock < (targetPerLocal * totalBranchesCount * 0.4)) {
        verdict = "COMPRA_URGENTE";
        verdictDetail = `Quiebre crítico en depósito (${product.depotStock}u) y en los 38 locales (${totalLocalesStock}u). Urge pedido de compra al proveedor.`;
      } else {
        verdict = "COMPRA_URGENTE";
        verdictDetail = `Bajo stock para cubrir 2 semanas (${totalChainStock}u disponibles vs ${Math.round(idealCoverageTarget)}u de meta).`;
      }

      return {
        ...product,
        effectiveTargetPerLocal: targetPerLocal,
        totalLocalesStock,
        totalChainStock,
        idealCoverageTarget: Math.round(idealCoverageTarget),
        missingToOrder: Math.round(missingToOrder),
        totalPurchaseEstimatedARS,
        verdict,
        verdictDetail
      };
    });
  }, [activeSupplier, coolerParam, shelfParam, coverageMultiplier]);

  // Grand totals for active supplier line
  const supplierTotals = useMemo(() => {
    const totalDepotUnits = supplierAuditAnalysis.reduce((acc, p) => acc + p.depotStock, 0);
    const totalLocalesUnits = supplierAuditAnalysis.reduce((acc, p) => acc + p.totalLocalesStock, 0);
    const totalChainUnits = supplierAuditAnalysis.reduce((acc, p) => acc + p.totalChainStock, 0);
    const totalUnitsToOrder = supplierAuditAnalysis.reduce((acc, p) => acc + p.missingToOrder, 0);
    const totalBudgetARS = supplierAuditAnalysis.reduce((acc, p) => acc + p.totalPurchaseEstimatedARS, 0);
    const urgentItemsCount = supplierAuditAnalysis.filter(p => p.verdict === "COMPRA_URGENTE").length;
    const redistributionItemsCount = supplierAuditAnalysis.filter(p => p.verdict === "REDISTRIBUCION").length;

    return {
      totalDepotUnits,
      totalLocalesUnits,
      totalChainUnits,
      totalUnitsToOrder,
      totalBudgetARS,
      urgentItemsCount,
      redistributionItemsCount
    };
  }, [supplierAuditAnalysis]);

  // 🔍 Trigger Google Drive / Inventory Audit simulation with Martín Voice
  const handleRunDriveInventoryAudit = () => {
    setIsAuditingDrive(true);
    speakMartin(
      `Iniciando auditoría de inventario en Google Drive para la red de las 38 sucursales y depósito central de Tbest. Analizando la línea de ${activeSupplier.name}.`
    );

    setTimeout(() => {
      setIsAuditingDrive(false);
      speakMartin(
        `Auditoría completada, Noemí. Verifiqué las 38 sucursales de Tbest. Para la línea ${activeSupplier.name}, tenemos ${supplierTotals.totalChainUnits} unidades en la cadena. Detecté ${supplierTotals.urgentItemsCount} productos con necesidad de orden de compra por un presupuesto estimado de ${formatARS(supplierTotals.totalBudgetARS)} y ${supplierTotals.redistributionItemsCount} productos para balanceo de stock entre locales.`
      );
    }, 1200);
  };

  // 1. Build Operational Directive Text for WhatsApp Group
  const generateDirectiveText = (): string => {
    const header = `📋 *DIRECTIVA OPERATIVA DE REPOSICIÓN - MARTÍN IA*\n🏢 *Destino:* ${selectedBranchForDirective}\n📅 *Fecha:* ${new Date().toLocaleDateString("es-AR")} | 🕒 *Horario Límite:* 18:30 hs\n👤 *Emite:* Dirección de Operaciones (${userDisplayName})\n🏬 *Red Tbest:* 38 Sucursales Activas`;

    if (directiveCategory === "coca_cola") {
      return `${header}\n\nEquipo del local: Por favor *editen este mensaje* indicando las cantidades de LÍNEA COCA-COLA que precisan para el fin de semana (Heladera + Góndola). No dejen casilleros vacíos:\n\n🥤 *LÍNEA COCA-COLA & GASEOSAS:*\n• Coca-Cola 1.5L: [ ] unidades\n• Coca-Cola 2.25L: [ ] unidades\n• Coca-Cola 500ml: [ ] unidades\n• Coca-Cola Zero 1.5L: [ ] unidades\n• Sprite 1.5L: [ ] unidades\n• Fanta Naranja 1.5L: [ ] unidades\n• Monster Energy 473ml: [ ] latas\n• Powerade 500ml: [ ] botellas\n• Cepita 1L: [ ] unidades\n• Hielo Rolito 4kg: [ ] bolsas\n\n📌 *Instrucciones:* Editen el número dentro de los corchetes y reenvíen la lista a este grupo para procesar el despacho desde depósito central.`;
    }

    if (directiveCategory === "bebidas") {
      return `${header}\n\nEquipo del local: Por favor *editen este mensaje* indicando las cantidades que necesitan recibir para el fin de semana:\n\n🍾 *LISTA DE BEBIDAS ALCOHÓLICAS & BARRA:*\n• Fernet Branca 750ml: [ ] botellas\n• Vodka Smirnoff 700ml: [ ] botellas\n• Vodka Absolut 700ml: [ ] botellas\n• Gin Beefeater 700ml: [ ] botellas\n• Aperol 750ml: [ ] botellas\n• Campari 750ml: [ ] botellas\n• Vino Rutini Malbec 750ml: [ ] botellas\n• Cerveza Quilmes 473ml (latas): [ ] latas\n• Cerveza Corona 330ml (porrones): [ ] unidades\n• Cerveza Heineken 473ml (latas): [ ] latas\n• Whisky Johnnie Walker Black: [ ] botellas\n• Hielo Rolito 4kg (bolsas): [ ] bolsas\n\nReenvíen la lista editada antes de las 18:30 hs.`;
    }

    if (directiveCategory === "gaseosas") {
      return `${header}\n\nEquipo: Editen las cantidades de bebidas sin alcohol que precisan reponer:\n\n🥤 *LISTA DE GASEOSAS & AGUAS:*\n• Coca-Cola 1.5L: [ ] unidades\n• Coca-Cola 2.25L: [ ] unidades\n• Sprite 1.5L: [ ] unidades\n• Paso de los Toros Tónica 1.5L: [ ] unidades\n• Agua Villavicencio 1.5L: [ ] unidades\n• Monster Energy 473ml: [ ] unidades\n• Hielo Rolito 4kg: [ ] bolsas\n\nReenvíen con las cantidades completas.`;
    }

    if (directiveCategory === "kiosco") {
      return `${header}\n\nEquipo: Indiquen la reposición de kiosco, golosinas y snacks:\n\n🍫 *LISTA DE GOLOSINAS & SNACKS:*\n• Alfajor Terrabusi Chocolate (cajas x40): [ ] cajas\n• Alfajor Havanna Mixto (cajas x12): [ ] cajas\n• Galletitas Oreo 118g: [ ] paquetes\n• Galletitas Pepitos 119g: [ ] paquetes\n• Chocolate Block 170g: [ ] unidades\n• Bon o Bon Leche (cajas x30): [ ] cajas\n• Chicle Beldent Menta (cajas x20): [ ] cajas\n\nReenvíen con las cantidades completas.`;
    }

    return `${header}\n\nEquipo: Por favor reenvíen detallando todos los productos, bebidas o mercadería faltante con sus cantidades para presupuestar el envío desde depósito.`;
  };

  const handleCopyDirective = () => {
    const text = generateDirectiveText();
    navigator.clipboard.writeText(text);
    setCopiedDirective(true);
    setTimeout(() => setCopiedDirective(false), 3000);
    speakMartin("Directiva de reposición copiada al portapapeles. Podés pegarla en el grupo de WhatsApp del local.");
  };

  const handleOpenWhatsAppDirective = () => {
    const text = generateDirectiveText();
    sendWhatsAppMessage({
      message: text
    });
  };

  // Sample quick tests for local branch responses
  const loadSampleResponse = (branchName: string) => {
    setSelectedBranchForResponse(branchName);
    if (branchName.includes("Palermo")) {
      setPastedGroupResponse(`Hola Noemí y Martín! Acá pasamos el pedido editado de Palermo para el finde:\n\n• Coca-Cola 1.5L: 48 unidades\n• Coca-Cola 2.25L: 36 unidades\n• Sprite 1.5L: 24 unidades\n• Monster Energy 473ml: 24 latas\n• Fernet Branca 750ml: 24 botellas\n• Vodka Smirnoff 700ml: 18 botellas\n• Cerveza Quilmes 473ml: 48 latas\n• Cerveza Corona 330ml: 36 porrones\n• Hielo Rolito 4kg: 20 bolsas`);
    } else if (branchName.includes("Belgrano")) {
      setPastedGroupResponse(`Pedido de Sucursal Belgrano:\n• Coca-Cola 1.5L: 36 unidades\n• Coca-Cola 500ml: 48 unidades\n• Fanta Naranja 1.5L: 24 unidades\n• Fernet Branca: 18 botellas\n• Cerveza Heineken 473ml: 36 latas\n• Chocolate Block 170g: 24 unidades\n• Alfajor Terrabusi Chocolate: 4 cajas\n• Hielo Rolito: 15 bolsas`);
    } else {
      setPastedGroupResponse(`Pedido Sucursal ${branchName}:\n• Coca-Cola 1.5L: 36 unidades\n• Coca-Cola 2.25L: 24 unidades\n• Monster Energy: 18 latas\n• Fernet Branca 750ml: 18 botellas\n• Gin Beefeater 700ml: 6 botellas\n• Cerveza Quilmes: 48 latas\n• Agua Villavicencio 1.5L: 36 unidades`);
    }
  };

  // 2. Intelligent Processing of Edited WhatsApp Response
  const handleProcessGroupResponse = () => {
    if (!pastedGroupResponse.trim()) {
      alert("Por favor pegá el mensaje o lista editada que te enviaron en el grupo de WhatsApp.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const lines = pastedGroupResponse.split("\n").filter(l => l.trim().length > 0);
      const availableItems: BranchOrderItem[] = [];
      const missingItems: BranchOrderItem[] = [];

      // Flatten all products across all suppliers for matching
      const allMasterProducts = MASTER_SUPPLIERS.flatMap(s => s.products);

      lines.forEach((line, idx) => {
        const qtyMatch = line.match(/(?:\[\s*(\d+)\s*\])|(?:(\d+)\s*(?:botellas?|unidades?|packs?|cajas?|latas?|bolsas?|porrones?|u\b|\b))|(?:\b(?:x|cant|cantidad|pedimos|necesitamos)\s*(\d+))/i);
        let qty = 0;
        if (qtyMatch) {
          qty = parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3] || "0", 10);
        }

        const cleanProductText = line
          .replace(/^[•\-\*\d\.\)\s\[\]]+/, "")
          .replace(/(?:\[\s*\d+\s*\])/g, "")
          .replace(/\d+\s*(?:botellas?|unidades?|packs?|cajas?|latas?|bolsas?|porrones?|u\b).*/i, "")
          .replace(/[-:|,]/g, " ")
          .trim();

        if (cleanProductText.length < 3 && qty === 0) return;

        let matched = allMasterProducts.find(p => 
          cleanProductText.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(cleanProductText.toLowerCase())
        );

        if (!matched) {
          const lower = cleanProductText.toLowerCase();
          if (lower.includes("coca-cola 1.5") || lower.includes("coca 1.5")) {
            matched = allMasterProducts.find(p => p.id === "coca-15");
          } else if (lower.includes("coca-cola 2.25") || lower.includes("coca 2.25")) {
            matched = allMasterProducts.find(p => p.id === "coca-225");
          } else if (lower.includes("coca") || lower.includes("cola")) {
            matched = allMasterProducts.find(p => p.id === "coca-15");
          } else if (lower.includes("fernet") || lower.includes("branca")) {
            matched = allMasterProducts.find(p => p.id === "fernet-branca");
          } else if (lower.includes("quilmes")) {
            matched = allMasterProducts.find(p => p.id === "quilmes-473");
          } else if (lower.includes("heineken")) {
            matched = allMasterProducts.find(p => p.id === "heineken-473");
          } else if (lower.includes("corona")) {
            matched = allMasterProducts.find(p => p.id === "corona-330");
          } else if (lower.includes("monster")) {
            matched = allMasterProducts.find(p => p.id === "monster-473");
          } else if (lower.includes("hielo")) {
            matched = allMasterProducts.find(p => p.id === "hielo-rolito-4kg");
          } else if (lower.includes("block")) {
            matched = allMasterProducts.find(p => p.id === "block-170");
          } else if (lower.includes("terrabusi")) {
            matched = allMasterProducts.find(p => p.id === "terrabusi-alfajor");
          }
        }

        const effectiveQty = qty > 0 ? qty : 24;
        const productName = matched ? matched.name : (cleanProductText || `Producto #${idx+1}`);
        const category = (matched?.category as any) || "Gaseosas & Aguas";
        const depotStock = matched ? matched.depotStock : 0;
        const unitCost = matched ? matched.unitCost : 1500;
        const unitDispatchPrice = matched ? matched.unitDispatchPrice : 2100;

        if (depotStock >= effectiveQty) {
          availableItems.push({
            id: `item-${Date.now()}-${idx}`,
            product: productName,
            category,
            quantityRequested: effectiveQty,
            stockAvailableInDepot: depotStock,
            isAvailable: true,
            unitCost,
            unitDispatchPrice,
            subtotal: effectiveQty * unitDispatchPrice,
            missingUnits: 0
          });
        } else if (depotStock > 0 && depotStock < effectiveQty) {
          const availableUnits = depotStock;
          const missingUnits = effectiveQty - depotStock;

          availableItems.push({
            id: `item-avail-${Date.now()}-${idx}`,
            product: `${productName} (Disponible Parcial)`,
            category,
            quantityRequested: availableUnits,
            stockAvailableInDepot: depotStock,
            isAvailable: true,
            unitCost,
            unitDispatchPrice,
            subtotal: availableUnits * unitDispatchPrice,
            missingUnits: 0
          });

          missingItems.push({
            id: `item-miss-${Date.now()}-${idx}`,
            product: productName,
            category,
            quantityRequested: missingUnits,
            stockAvailableInDepot: 0,
            isAvailable: false,
            unitCost,
            unitDispatchPrice,
            subtotal: missingUnits * unitDispatchPrice,
            missingUnits: missingUnits
          });
        } else {
          missingItems.push({
            id: `item-none-${Date.now()}-${idx}`,
            product: productName,
            category,
            quantityRequested: effectiveQty,
            stockAvailableInDepot: 0,
            isAvailable: false,
            unitCost,
            unitDispatchPrice,
            subtotal: effectiveQty * unitDispatchPrice,
            missingUnits: effectiveQty
          });
        }
      });

      const totalAvailableUnits = availableItems.reduce((sum, item) => sum + item.quantityRequested, 0);
      const totalMissingUnits = missingItems.reduce((sum, item) => sum + item.quantityRequested, 0);
      const totalQuotationARS = availableItems.reduce((sum, item) => sum + item.subtotal, 0);
      const totalCostARS = availableItems.reduce((sum, item) => sum + (item.quantityRequested * item.unitCost), 0);

      const newQuotation: BranchOrderQuotation = {
        id: `quote-${Date.now()}`,
        branchName: selectedBranchForResponse,
        createdAt: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
        rawPastedText: pastedGroupResponse,
        availableItems,
        missingItems,
        totalAvailableUnits,
        totalMissingUnits,
        totalQuotationARS,
        totalCostARS,
        status: "presupuestado"
      };

      const updated = [newQuotation, ...quotations.filter(q => q.branchName !== selectedBranchForResponse)];
      saveQuotations(updated);
      setActiveQuotationId(newQuotation.id);
      setIsProcessing(false);
      setPastedGroupResponse("");

      speakMartin(
        `He procesado el pedido del grupo de ${selectedBranchForResponse}. Separé ${totalAvailableUnits} unidades disponibles en depósito central con una cotización de despacho de ${formatARS(totalQuotationARS)}, y ${totalMissingUnits} unidades faltantes para compra consolidada.`
      );
    }, 600);
  };

  // 3. Multi-Group Missing Products Consolidation across ALL branches
  const computeMultiGroupMissingConsolidation = (): ConsolidatedMissingProduct[] => {
    const map = new Map<string, {
      product: string;
      category: string;
      totalUnitsNeeded: number;
      requestedByBranches: Array<{ branchName: string; units: number }>;
      estimatedSupplierUnitCost: number;
    }>();

    quotations.forEach(q => {
      q.missingItems.forEach(item => {
        const key = item.product.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            product: item.product,
            category: item.category,
            totalUnitsNeeded: 0,
            requestedByBranches: [],
            estimatedSupplierUnitCost: item.unitCost
          });
        }
        const record = map.get(key)!;
        record.totalUnitsNeeded += item.quantityRequested;
        record.requestedByBranches.push({
          branchName: q.branchName,
          units: item.quantityRequested
        });
      });
    });

    return Array.from(map.values()).map(r => ({
      product: r.product,
      category: r.category,
      totalUnitsNeeded: r.totalUnitsNeeded,
      requestedByBranches: r.requestedByBranches,
      estimatedSupplierUnitCost: r.estimatedSupplierUnitCost,
      estimatedTotalPurchaseARS: r.totalUnitsNeeded * r.estimatedSupplierUnitCost
    }));
  };

  const consolidatedMissingList = computeMultiGroupMissingConsolidation();
  const totalBranchesQuotedCount = quotations.length;
  const grandTotalAvailableUnits = quotations.reduce((acc, q) => acc + q.totalAvailableUnits, 0);
  const grandTotalMissingUnits = consolidatedMissingList.reduce((acc, c) => acc + c.totalUnitsNeeded, 0);
  const grandTotalQuotationARS = quotations.reduce((acc, q) => acc + q.totalQuotationARS, 0);
  const grandTotalPurchaseARS = consolidatedMissingList.reduce((acc, c) => acc + c.estimatedTotalPurchaseARS, 0);

  const activeQuote = quotations.find(q => q.id === activeQuotationId) || quotations[0] || null;

  // 4. Export Official Supplier Purchase Order to Excel
  const handleExportSupplierPurchaseOrderExcel = () => {
    const wb = XLSX.utils.book_new();

    const rows = supplierAuditAnalysis.map((p, idx) => ({
      "N°": idx + 1,
      "Producto / Línea": p.name,
      "Categoría": p.category,
      "Stock en Depósito": p.depotStock,
      "Stock en 38 Sucursales": p.totalLocalesStock,
      "Stock Total Cadena": p.totalChainStock,
      "Meta Objetivo Cadena": p.idealCoverageTarget,
      "Diagnóstico Martín IA": p.verdict === "COMPRA_URGENTE" ? "COMPRA URGENTE A PROVEEDOR" : p.verdict === "REDISTRIBUCION" ? "BALANCEO / TRASLADO INTERNO" : "STOCK ÓPTIMO",
      "Cant. a Comprar (Unidades)": p.missingToOrder,
      "Precio Unit. Remito ($)": p.unitCost,
      "Subtotal Estimado ($)": p.totalPurchaseEstimatedARS
    }));

    rows.push({
      "N°": "" as any,
      "Producto / Línea": "TOTAL ORDEN DE COMPRA CONSOLIDADA",
      "Categoría": "",
      "Stock en Depósito": supplierTotals.totalDepotUnits,
      "Stock en 38 Sucursales": supplierTotals.totalLocalesUnits,
      "Stock Total Cadena": supplierTotals.totalChainUnits,
      "Meta Objetivo Cadena": "" as any,
      "Diagnóstico Martín IA": "",
      "Cant. a Comprar (Unidades)": supplierTotals.totalUnitsToOrder,
      "Precio Unit. Remito ($)": "" as any,
      "Subtotal Estimado ($)": supplierTotals.totalBudgetARS
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Orden_Compra_Proveedor");
    XLSX.writeFile(wb, `Orden_Compra_${activeSupplier.name.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 5. Send Purchase Order to Supplier via WhatsApp
  const handleSendSupplierWhatsAppOrder = () => {
    let msg = `🛒 *SOLICITUD DE ORDEN DE COMPRA CONSOLIDADA - MARTÍN IA*\n🏢 *Proveedor:* ${activeSupplier.name}\n👤 *Emite:* ${userDisplayName} (Dirección de Operaciones Tbest)\n📅 *Fecha:* ${new Date().toLocaleDateString("es-AR")}\n🏬 *Destino:* Depósito Central para Red de 38 Sucursales\n\nEstimados: Solicitamos cotización y despacho urgente para la siguiente orden de reposición (Línea ${activeSupplier.name}):\n\n`;

    supplierAuditAnalysis
      .filter(p => p.missingToOrder > 0)
      .forEach((p, idx) => {
        msg += `${idx + 1}. *${p.name}* -> *${p.missingToOrder} ${p.packageType}* (Costo Remito: ${formatARS(p.unitCost)} / u.) = *${formatARS(p.totalPurchaseEstimatedARS)}*\n`;
      });

    msg += `\n📦 *Total Unidades Solicitadas:* ${supplierTotals.totalUnitsToOrder} unidades\n💰 *Presupuesto Estimado Remito:* *${formatARS(supplierTotals.totalBudgetARS)}*\n\n¿Tienen disponibilidad de entrega en depósito central para los días habituales (${activeSupplier.deliveryDays})?`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  // 🧹 6. Master Reset
  const handleClearAllTestData = () => {
    if (window.confirm("¿Seguro que querés limpiar todos los presupuestos y reiniciar la memoria de pedidos?")) {
      setQuotations([]);
      setActiveQuotationId(null);
      setPastedGroupResponse("");
      localStorage.removeItem("martin_branch_quotations_v2");
      speakMartin("Memoria de pedidos reiniciada exitosamente.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 🚀 1. HERO & NETWORK OVERVIEW BANNER */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/30">
              <Boxes className="w-3.5 h-3.5" />
              <span>Red Integral de 38 Sucursales & Depósito Central</span>
            </div>
            <h3 className="font-black text-xl md:text-2xl tracking-tight text-white">
              Gestión de Pedidos, Auditoría de Stock & Proveedores
            </h3>
            <p className="text-xs md:text-sm text-indigo-200 leading-relaxed">
              Martín audita el inventario en Google Drive y compara el stock de las <strong className="text-emerald-400">38 sucursales</strong> más el <strong className="text-teal-300">depósito central</strong>. Si hay stock en la cadena recomienda <strong className="text-indigo-300">redistribución</strong>, y si hay quiebre real arma el <strong className="text-amber-400">pedido consolidado por proveedor</strong> con costos de remito para 1.5 a 2 semanas de cobertura.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-center min-w-[90px]">
              <span className="block text-xl font-black text-emerald-400 font-mono">38</span>
              <span className="text-[10px] text-slate-300 font-bold uppercase">Sucursales</span>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-center min-w-[90px]">
              <span className="block text-xl font-black text-teal-300 font-mono">{supplierTotals.totalChainUnits}</span>
              <span className="text-[10px] text-slate-300 font-bold uppercase">Stock Cadena</span>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-center min-w-[90px]">
              <span className="block text-xl font-black text-amber-400 font-mono">{supplierTotals.totalUnitsToOrder}</span>
              <span className="text-[10px] text-slate-300 font-bold uppercase">A Pedir</span>
            </div>

            <button
              type="button"
              onClick={handleRunDriveInventoryAudit}
              disabled={isAuditingDrive}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center min-w-[95px] cursor-pointer shadow-md"
              title="Auditar stock real de las 38 sucursales en Google Drive"
            >
              <RefreshCw className={`w-4 h-4 text-white mb-0.5 ${isAuditingDrive ? "animate-spin" : ""}`} />
              <span className="text-[10px] uppercase font-bold">{isAuditingDrive ? "Auditando..." : "Auditar Drive"}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveSubTab("supplier_lines")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "supplier_lines"
                ? "bg-emerald-500 text-slate-950 font-black shadow-md"
                : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>1. Auditoría por Proveedor & Cobertura (38 Locales)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("branch_directives")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "branch_directives"
                ? "bg-indigo-600 text-white font-black shadow-md"
                : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>2. Directivas WhatsApp a Grupos de Locales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("multi_group_missing")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "multi_group_missing"
                ? "bg-amber-500 text-slate-950 font-black shadow-md"
                : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>3. Faltantes de Grupos ({consolidatedMissingList.length})</span>
          </button>
        </div>
      </div>

      {/* 🚀 TAB 1: AUDITORÍA POR PROVEEDOR, COMPARACIÓN 38 LOCALES + DEPÓSITO Y ORDEN DE COMPRA */}
      {activeSubTab === "supplier_lines" && (
        <div className="space-y-6">
          {/* Supplier Selector & Parameters Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md uppercase">
                  Auditoría por Proveedor
                </span>
                <h4 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Store className="w-5 h-5 text-indigo-600" />
                  <span>Seleccionar Proveedor / Distribuidora:</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Martín evalúa todos los productos de la línea del proveedor sumando depósito + las 38 sucursales.
                </p>
              </div>

              {/* Suppliers Buttons Grid */}
              <div className="flex flex-wrap items-center gap-2">
                {MASTER_SUPPLIERS.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSupplierId(s.id);
                      speakMartin(`Cargando línea completa de ${s.name} para las 38 sucursales.`);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedSupplierId === s.id
                        ? "bg-indigo-600 text-white shadow-md font-black"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{s.name.split("/")[0]}</span>
                    <span className="px-1.5 py-0.5 bg-black/20 text-white rounded text-[10px]">
                      {s.products.length} productos
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Formula Controls: Cooler + Shelf + Reposition Frequency */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>Parámetros de Demanda por Sucursal & Cobertura:</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Total Red: <strong>38 Sucursales</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    🥤 Heladera por Local (u.):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={coolerParam}
                    onChange={(e) => setCoolerParam(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Objetivo en frío visible</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    📦 Góndola / Reserva (u.):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={shelfParam}
                    onChange={(e) => setShelfParam(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Respaldo para reposición</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    🎯 Meta por Sucursal:
                  </label>
                  <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-mono font-black text-indigo-950">
                    {coolerParam + shelfParam} unidades / local
                  </div>
                  <span className="text-[10px] text-indigo-600 font-medium">({(coolerParam + shelfParam) * 38} u. en red)</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    ⏳ Cobertura (Ciclos 3x):
                  </label>
                  <select
                    value={coverageMultiplier}
                    onChange={(e) => setCoverageMultiplier(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 cursor-pointer"
                  >
                    <option value={2}>2x Reposiciones (1 semana)</option>
                    <option value={3}>3x Reposiciones (1.5 a 2 semanas - Recomendado)</option>
                    <option value={4}>4x Reposiciones (3 semanas)</option>
                  </select>
                  <span className="text-[10px] text-slate-400">Frecuencia: {activeSupplier.repFrequency}</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 uppercase">Stock Total Cadena</span>
                  <Warehouse className="w-4 h-4 text-emerald-700" />
                </div>
                <span className="block text-2xl font-black text-emerald-950 font-mono">
                  {supplierTotals.totalChainUnits} u.
                </span>
                <p className="text-[11px] text-emerald-800">
                  Depósito ({supplierTotals.totalDepotUnits}u) + 38 Locales ({supplierTotals.totalLocalesUnits}u)
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 uppercase">Déficit a Comprar</span>
                  <ShoppingBag className="w-4 h-4 text-amber-700" />
                </div>
                <span className="block text-2xl font-black text-amber-950 font-mono">
                  {supplierTotals.totalUnitsToOrder} u.
                </span>
                <p className="text-[11px] text-amber-800">
                  {supplierTotals.urgentItemsCount} productos por debajo de la cobertura de 2 semanas
                </p>
              </div>

              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-950 uppercase">Presupuesto Remito</span>
                  <DollarSign className="w-4 h-4 text-indigo-700" />
                </div>
                <span className="block text-2xl font-black text-indigo-950 font-mono">
                  {formatARS(supplierTotals.totalBudgetARS)}
                </span>
                <p className="text-[11px] text-indigo-800">
                  Calculado con costos unitarios oficiales de compra
                </p>
              </div>
            </div>

            {/* Analysis Table for Supplier Products */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h5 className="font-black text-slate-900 text-sm">
                  Detalle de Línea: {activeSupplier.name} ({supplierAuditAnalysis.length} Productos)
                </h5>
                <span className="text-xs text-slate-500 font-mono">
                  Días de entrega proveedor: <strong>{activeSupplier.deliveryDays}</strong>
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Producto / Presentación</th>
                      <th className="py-3 px-2 text-center">Depósito</th>
                      <th className="py-3 px-2 text-center">38 Locales</th>
                      <th className="py-3 px-2 text-center">Total Cadena</th>
                      <th className="py-3 px-2 text-center">Meta Cobertura</th>
                      <th className="py-3 px-3">Diagnóstico Martín IA</th>
                      <th className="py-3 px-2 text-center">A Comprar</th>
                      <th className="py-3 px-2 text-right">Costo Remito</th>
                      <th className="py-3 px-3 text-right">Subtotal ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {supplierAuditAnalysis.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Obj: {p.effectiveTargetPerLocal} u/local ({p.coolerTarget} frío + {p.shelfTarget} góndola)
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-slate-700">
                          {p.depotStock} u.
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-600">
                          {p.totalLocalesStock} u.
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-black text-slate-900">
                          {p.totalChainStock} u.
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-indigo-700">
                          {p.idealCoverageTarget} u.
                        </td>
                        <td className="py-3 px-3">
                          {p.verdict === "COMPRA_URGENTE" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-black">
                              <Flame className="w-3 h-3 text-rose-600" />
                              <span>Compra Urgente</span>
                            </span>
                          ) : p.verdict === "REDISTRIBUCION" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-black">
                              <ArrowRightLeft className="w-3 h-3 text-indigo-600" />
                              <span>Balanceo / Redistribución</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Stock Óptimo</span>
                            </span>
                          )}
                          <span className="block text-[10px] text-slate-500 mt-0.5 line-clamp-1" title={p.verdictDetail}>
                            {p.verdictDetail}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-black text-sm text-amber-600">
                          {p.missingToOrder > 0 ? `${p.missingToOrder} u.` : "—"}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-slate-600">
                          {formatARS(p.unitCost)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-950">
                          {p.totalPurchaseEstimatedARS > 0 ? formatARS(p.totalPurchaseEstimatedARS) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions for Supplier Order */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  🏢 Proveedor: <strong>{activeSupplier.company}</strong> • Contacto: <strong>{activeSupplier.contactPhone}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportSupplierPurchaseOrderExcel}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Descargar Orden en Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendSupplierWhatsAppOrder}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs md:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>📲 Enviar Orden a Proveedor por WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 38 Branches Directory Overview */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Red de 38 Sucursales Activas de Tbest</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Todas las sucursales conectadas para reposición y balanceo de inventario.
                </p>
              </div>

              {/* Zone Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["TODAS", "CABA", "GBA Norte", "GBA Sur", "GBA Oeste"].map(zone => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => setSelectedZoneFilter(zone)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedZoneFilter === zone ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
              {filteredBranches.map(b => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 hover:border-indigo-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">{b.name}</span>
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[9px] font-mono font-bold">
                      {b.zone}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{b.address}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-600 font-mono">
                    <span>Resp: {b.manager.split(" ")[0]}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBranchForResponse(b.name);
                        setActiveSubTab("branch_directives");
                      }}
                      className="text-indigo-600 hover:underline font-bold"
                    >
                      Cargar Pedido &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 TAB 2: DIRECTIVAS DE WHATSAPP A GRUPOS & PROCESAMIENTO DE RESPUESTAS */}
      {activeSubTab === "branch_directives" && (
        <div className="space-y-6">
          {/* PASO 1: GENERADOR DE DIRECTIVAS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded-md">PASO 1</span>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    Generar Directiva de Reposición para Grupos de WhatsApp
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  Martín arma una directiva con lista editable para que los locales completen las cantidades de bebidas y mercadería.
                </p>
              </div>

              {/* Preset templates */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDirectiveCategory("coca_cola")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    directiveCategory === "coca_cola" ? "bg-indigo-600 text-white shadow-sm font-black" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  🥤 Línea Coca-Cola
                </button>
                <button
                  type="button"
                  onClick={() => setDirectiveCategory("bebidas")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    directiveCategory === "bebidas" ? "bg-indigo-600 text-white shadow-sm font-black" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  🍾 Bebidas & Alcohol
                </button>
                <button
                  type="button"
                  onClick={() => setDirectiveCategory("kiosco")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    directiveCategory === "kiosco" ? "bg-indigo-600 text-white shadow-sm font-black" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  🍫 Kiosco & Snacks
                </button>
              </div>
            </div>

            {/* Branch Selector with all 38 branches */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase shrink-0">
                Destinatario:
              </label>
              <select
                value={selectedBranchForDirective}
                onChange={(e) => setSelectedBranchForDirective(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
              >
                <option value="Todos los Grupos (38 Sucursales)">🏢 Todos los Grupos (38 Sucursales)</option>
                {MASTER_38_BRANCHES.map(l => (
                  <option key={l.id} value={l.name}>{l.name} ({l.manager}) - {l.zone}</option>
                ))}
              </select>
            </div>

            {/* Generated Directive Preview Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {generateDirectiveText()}
            </div>

            {/* Action Buttons for Directive */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyDirective}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedDirective ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDirective ? "¡Copiado!" : "Copiar Directiva"}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsAppDirective}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>📲 Abrir WhatsApp y Enviar a Grupo</span>
              </button>
            </div>
          </div>

          {/* PASO 2: PEGAR Y PROCESAR LA RESPUESTA EDITADA */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md">PASO 2</span>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    Pegar la Lista Editada que Envió el Local por WhatsApp
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  Pegá el mensaje con las cantidades que completó la sucursal para que Martín lo cotice contra el stock central.
                </p>
              </div>

              {/* Quick Sample Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-bold hidden md:inline">Cargar ejemplo:</span>
                <button
                  type="button"
                  onClick={() => loadSampleResponse("Local 2 - Palermo")}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200 transition-all cursor-pointer"
                >
                  Palermo
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleResponse("Local 3 - Belgrano")}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200 transition-all cursor-pointer"
                >
                  Belgrano
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleResponse("Local 7 - Recoleta")}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200 transition-all cursor-pointer"
                >
                  Recoleta
                </button>
              </div>
            </div>

            {/* Branch Selector for Response (All 38) */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase shrink-0">
                Sucursal que envió la respuesta:
              </label>
              <select
                value={selectedBranchForResponse}
                onChange={(e) => setSelectedBranchForResponse(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
              >
                {MASTER_38_BRANCHES.map(l => (
                  <option key={l.id} value={l.name}>{l.name} ({l.manager}) - {l.zone}</option>
                ))}
              </select>
            </div>

            {/* Textarea for pasted message */}
            <textarea
              rows={5}
              value={pastedGroupResponse}
              onChange={(e) => setPastedGroupResponse(e.target.value)}
              placeholder={"Pegá acá el mensaje del grupo de WhatsApp con la lista editada...\nEjemplo:\n• Coca-Cola 1.5L: 48 unidades\n• Coca-Cola 2.25L: 36 unidades\n• Monster Energy: 24 latas\n• Fernet Branca 750ml: 24 botellas\n• Cerveza Quilmes 473ml: 48 latas"}
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs md:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
            />

            {/* Process Button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleProcessGroupResponse}
                disabled={!pastedGroupResponse.trim() || isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-300 disabled:to-slate-400 text-slate-950 font-black text-xs md:text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Comparando con Inventario Central...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>🪄 Procesar Pedido & Cotizar Despacho</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PASO 3: SEPARACIÓN Y COTIZACIÓN POR SUCURSAL */}
          {quotations.length > 0 && activeQuote && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black rounded-md">PASO 3</span>
                    <h4 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      <span>Presupuesto y Despacho para: {activeQuote.branchName}</span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Procesado a las {activeQuote.createdAt} hs • Cotización oficial lista para enviar al grupo.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {quotations.map(q => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setActiveQuotationId(q.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeQuote.id === q.id
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{q.branchName.replace("Local ", "L")}</span>
                      <span className="px-1.5 py-0.2 bg-black/20 text-white rounded text-[10px]">
                        {q.totalAvailableUnits} u.
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Items */}
              <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h5 className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Productos Disponibles en Depósito Central ({activeQuote.availableItems.length})</span>
                    </h5>
                    <p className="text-xs text-emerald-800">
                      Mercadería con stock suficiente en depósito, lista para remito y despacho.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-bold text-emerald-800 uppercase">Presupuesto Despacho</span>
                    <span className="text-xl font-black text-emerald-950 font-mono">
                      {formatARS(activeQuote.totalQuotationARS)}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-emerald-200 text-emerald-900 uppercase font-black text-[10px]">
                        <th className="pb-2">Producto / Bebida</th>
                        <th className="pb-2 text-center">Cant. Solicitada</th>
                        <th className="pb-2 text-center">Stock Depósito</th>
                        <th className="pb-2 text-right">Precio Despacho</th>
                        <th className="pb-2 text-right">Subtotal ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                      {activeQuote.availableItems.map(item => (
                        <tr key={item.id} className="text-slate-800 font-medium">
                          <td className="py-2.5 font-bold text-slate-900">{item.product}</td>
                          <td className="py-2.5 text-center font-mono font-black text-emerald-800">
                            {item.quantityRequested} u.
                          </td>
                          <td className="py-2.5 text-center font-mono text-slate-500">
                            {item.stockAvailableInDepot} u.
                          </td>
                          <td className="py-2.5 text-right font-mono">{formatARS(item.unitDispatchPrice)}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-slate-950">
                            {formatARS(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Missing Items */}
              {activeQuote.missingItems.length > 0 && (
                <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h5 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Productos Faltantes / Quiebre de Stock ({activeQuote.missingItems.length})</span>
                      </h5>
                      <p className="text-xs text-amber-800">
                        Artículos pedidos por {activeQuote.branchName} que no están en depósito y entran en la compra a proveedores.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-200 text-amber-950 rounded-xl text-xs font-mono font-black">
                      {activeQuote.totalMissingUnits} u. en quiebre
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {activeQuote.missingItems.map(item => (
                      <div key={item.id} className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                        <div>
                          <span className="block font-bold text-xs text-slate-900">{item.product}</span>
                          <span className="text-[10px] text-slate-500">Costo Remito: {formatARS(item.unitCost)}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-mono font-black text-xs rounded-md">
                          Faltan {item.quantityRequested} u.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 🚀 TAB 3: FALTANTES AGILIZADOS MULTI-GRUPO */}
      {activeSubTab === "multi_group_missing" && (
        <div className="space-y-6">
          {consolidatedMissingList.length > 0 ? (
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl border border-amber-500/40 shadow-xl p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-black uppercase tracking-wider border border-amber-500/30">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Consolidación Multi-Grupo para Proveedores</span>
                  </div>
                  <h4 className="font-black text-lg md:text-xl text-white">
                    Faltantes Agrupados de Todas las Sucursales ({consolidatedMissingList.length} Productos)
                  </h4>
                  <p className="text-xs text-slate-300">
                    Martín sumó los faltantes de todos los locales que mandaron pedidos para que hagas una única orden de compra a distribuidoras.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-center">
                    <span className="block text-xl font-black text-amber-400 font-mono">{grandTotalMissingUnits}</span>
                    <span className="text-[10px] text-slate-300 font-bold uppercase">Unidades a Pedir</span>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-center">
                    <span className="block text-xl font-black text-emerald-400 font-mono">{formatARS(grandTotalPurchaseARS)}</span>
                    <span className="text-[10px] text-slate-300 font-bold uppercase">Costo Estimado</span>
                  </div>
                </div>
              </div>

              {/* Consolidated Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/15 text-slate-300 uppercase font-black text-[10px]">
                      <th className="pb-2">Producto Faltante</th>
                      <th className="pb-2">Sucursales Solicitantes</th>
                      <th className="pb-2 text-center">Cant. Locales</th>
                      <th className="pb-2 text-center">Total a Comprar</th>
                      <th className="pb-2 text-right">Costo Remito</th>
                      <th className="pb-2 text-right">Total ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-medium">
                    {consolidatedMissingList.map((c, i) => (
                      <tr key={i} className="text-white">
                        <td className="py-3 font-bold text-amber-300">{c.product}</td>
                        <td className="py-3 text-slate-300 text-[11px]">
                          {c.requestedByBranches.map(b => `${b.branchName} (${b.units}u)`).join(" • ")}
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 rounded-md font-mono font-bold text-[10px]">
                            {c.requestedByBranches.length} locales
                          </span>
                        </td>
                        <td className="py-3 text-center font-mono font-black text-amber-400 text-sm">
                          {c.totalUnitsNeeded} u.
                        </td>
                        <td className="py-3 text-right font-mono text-slate-300">{formatARS(c.estimatedSupplierUnitCost)}</td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-400">
                          {formatARS(c.estimatedTotalPurchaseARS)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-10 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h5 className="font-extrabold text-slate-800 text-base">No hay pedidos con faltantes pendientes</h5>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cuando cargues los pedidos de WhatsApp de los locales en la pestaña "Directivas WhatsApp", cualquier producto sin stock en depósito se consolidará automáticamente acá.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
