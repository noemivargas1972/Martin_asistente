export interface BranchInfo {
  id: string;
  number: number;
  name: string;
  shortName: string;
  address: string;
  zone: "CABA" | "GBA Norte" | "GBA Sur" | "GBA Oeste";
  phone: string;
  manager: string;
  whatsappGroup: string;
  baseEf: number;
  baseDig: number;
  color: string;
}

export const MASTER_38_BRANCHES: BranchInfo[] = [
  { id: "local-1", number: 1, name: "Local 1 - Centro", shortName: "L1 Centro", address: "Av. Corrientes 1400", zone: "CABA", phone: "+54 9 11 4321-1001", manager: "Carlos Rossi", whatsappGroup: "TBEST - L01 Centro", baseEf: 380000, baseDig: 450000, color: "border-l-blue-500" },
  { id: "local-2", number: 2, name: "Local 2 - Palermo", shortName: "L2 Palermo", address: "Honduras 4800", zone: "CABA", phone: "+54 9 11 4832-2002", manager: "Mariana Silva", whatsappGroup: "TBEST - L02 Palermo", baseEf: 420000, baseDig: 730000, color: "border-l-emerald-500" },
  { id: "local-3", number: 3, name: "Local 3 - Belgrano", shortName: "L3 Belgrano", address: "Av. Cabildo 2200", zone: "CABA", phone: "+54 9 11 4781-3003", manager: "Esteban Paz", whatsappGroup: "TBEST - L03 Belgrano", baseEf: 350000, baseDig: 600000, color: "border-l-purple-500" },
  { id: "local-4", number: 4, name: "Local 4 - Almagro", shortName: "L4 Almagro", address: "Av. Rivadavia 3900", zone: "CABA", phone: "+54 9 11 4958-4004", manager: "Lucía Méndez", whatsappGroup: "TBEST - L04 Almagro", baseEf: 310000, baseDig: 410000, color: "border-l-amber-500" },
  { id: "local-5", number: 5, name: "Local 5 - Flores", shortName: "L5 Flores", address: "Av. Rivadavia 6500", zone: "CABA", phone: "+54 9 11 4612-5005", manager: "Gonzalo Torres", whatsappGroup: "TBEST - L05 Flores", baseEf: 450000, baseDig: 440000, color: "border-l-pink-500" },
  { id: "local-6", number: 6, name: "Local 6 - Caballito", shortName: "L6 Caballito", address: "Av. Acoyte 100", zone: "CABA", phone: "+54 9 11 4902-6006", manager: "Paula Vega", whatsappGroup: "TBEST - L06 Caballito", baseEf: 390000, baseDig: 520000, color: "border-l-cyan-500" },
  { id: "local-7", number: 7, name: "Local 7 - Recoleta", shortName: "L7 Recoleta", address: "Av. Santa Fe 1900", zone: "CABA", phone: "+54 9 11 4801-7007", manager: "Javier Morales", whatsappGroup: "TBEST - L07 Recoleta", baseEf: 410000, baseDig: 870000, color: "border-l-indigo-500" },
  { id: "local-8", number: 8, name: "Local 8 - Devoto", shortName: "L8 Devoto", address: "Av. Beiró 4200", zone: "CABA", phone: "+54 9 11 4501-8008", manager: "Valeria Gómez", whatsappGroup: "TBEST - L08 Devoto", baseEf: 290000, baseDig: 390000, color: "border-l-slate-500" },
  { id: "local-9", number: 9, name: "Local 9 - San Telmo", shortName: "L9 San Telmo", address: "Defensa 800", zone: "CABA", phone: "+54 9 11 4361-9009", manager: "Andrés Benítez", whatsappGroup: "TBEST - L09 San Telmo", baseEf: 340000, baseDig: 410000, color: "border-l-yellow-500" },
  { id: "local-10", number: 10, name: "Local 10 - Nuñez", shortName: "L10 Nuñez", address: "Av. Libertador 7200", zone: "CABA", phone: "+54 9 11 4701-1010", manager: "Romina Castro", whatsappGroup: "TBEST - L10 Nuñez", baseEf: 360000, baseDig: 660000, color: "border-l-sky-500" },
  { id: "local-11", number: 11, name: "Local 11 - Villa Urquiza", shortName: "L11 Urquiza", address: "Av. Triunvirato 4500", zone: "CABA", phone: "+54 9 11 4521-1011", manager: "Facundo Rivas", whatsappGroup: "TBEST - L11 Urquiza", baseEf: 370000, baseDig: 510000, color: "border-l-rose-500" },
  { id: "local-12", number: 12, name: "Local 12 - Villa Crespo", shortName: "L12 Crespo", address: "Av. Corrientes 5200", zone: "CABA", phone: "+54 9 11 4851-1012", manager: "Camila Ortiz", whatsappGroup: "TBEST - L12 Crespo", baseEf: 330000, baseDig: 480000, color: "border-l-teal-500" },
  { id: "local-13", number: 13, name: "Local 13 - Barracas", shortName: "L13 Barracas", address: "Av. Montes de Oca 900", zone: "CABA", phone: "+54 9 11 4301-1013", manager: "Damián Soto", whatsappGroup: "TBEST - L13 Barracas", baseEf: 290000, baseDig: 370000, color: "border-l-orange-500" },
  { id: "local-14", number: 14, name: "Local 14 - Colegiales", shortName: "L14 Colegiales", address: "Av. Federico Lacroze 2400", zone: "CABA", phone: "+54 9 11 4551-1014", manager: "Lorena Flores", whatsappGroup: "TBEST - L14 Colegiales", baseEf: 350000, baseDig: 590000, color: "border-l-violet-500" },
  { id: "local-15", number: 15, name: "Local 15 - Saavedra", shortName: "L15 Saavedra", address: "Av. Balbín 3800", zone: "CABA", phone: "+54 9 11 4541-1015", manager: "Matías Cardozo", whatsappGroup: "TBEST - L15 Saavedra", baseEf: 310000, baseDig: 430000, color: "border-l-lime-500" },
  { id: "local-16", number: 16, name: "Local 16 - Liniers", shortName: "L16 Liniers", address: "Av. Rivadavia 11500", zone: "CABA", phone: "+54 9 11 4641-1016", manager: "Jorge Blanco", whatsappGroup: "TBEST - L16 Liniers", baseEf: 410000, baseDig: 390000, color: "border-l-red-500" },
  { id: "local-17", number: 17, name: "Local 17 - San Martín", shortName: "L17 San Martín", address: "Calle 85 2100", zone: "GBA Norte", phone: "+54 9 11 4751-1017", manager: "Agustina Pereyra", whatsappGroup: "TBEST - L17 San Martín", baseEf: 340000, baseDig: 420000, color: "border-l-fuchsia-500" },
  { id: "local-18", number: 18, name: "Local 18 - Vicente López", shortName: "L18 Vicente López", address: "Av. Maipú 1200", zone: "GBA Norte", phone: "+54 9 11 4791-1018", manager: "Ignacio Herrera", whatsappGroup: "TBEST - L18 Vicente López", baseEf: 390000, baseDig: 610000, color: "border-l-emerald-500" },
  { id: "local-19", number: 19, name: "Local 19 - Olivos", shortName: "L19 Olivos", address: "Av. Maipú 2800", zone: "GBA Norte", phone: "+54 9 11 4795-1019", manager: "Florencia Duarte", whatsappGroup: "TBEST - L19 Olivos", baseEf: 420000, baseDig: 680000, color: "border-l-blue-500" },
  { id: "local-20", number: 20, name: "Local 20 - Martínez", shortName: "L20 Martínez", address: "Av. Santa Fe 2100", zone: "GBA Norte", phone: "+54 9 11 4798-1020", manager: "Santiago Luna", whatsappGroup: "TBEST - L20 Martínez", baseEf: 440000, baseDig: 720000, color: "border-l-purple-500" },
  { id: "local-21", number: 21, name: "Local 21 - San Isidro", shortName: "L21 San Isidro", address: "Belgrano 300", zone: "GBA Norte", phone: "+54 9 11 4742-1021", manager: "Micaela Ramos", whatsappGroup: "TBEST - L21 San Isidro", baseEf: 460000, baseDig: 790000, color: "border-l-amber-500" },
  { id: "local-22", number: 22, name: "Local 22 - Tigre", shortName: "L22 Tigre", address: "Av. Cazón 1100", zone: "GBA Norte", phone: "+54 9 11 4749-1022", manager: "Lucas Navarro", whatsappGroup: "TBEST - L22 Tigre", baseEf: 380000, baseDig: 530000, color: "border-l-cyan-500" },
  { id: "local-23", number: 23, name: "Local 23 - Avellaneda", shortName: "L23 Avellaneda", address: "Av. Mitre 1400", zone: "GBA Sur", phone: "+54 9 11 4201-1023", manager: "Gisela Maidana", whatsappGroup: "TBEST - L23 Avellaneda", baseEf: 390000, baseDig: 480000, color: "border-l-pink-500" },
  { id: "local-24", number: 24, name: "Local 24 - Quilmes", shortName: "L24 Quilmes", address: "Peatonal Rivadavia 250", zone: "GBA Sur", phone: "+54 9 11 4253-1024", manager: "Fernando Ruiz", whatsappGroup: "TBEST - L24 Quilmes", baseEf: 410000, baseDig: 520000, color: "border-l-indigo-500" },
  { id: "local-25", number: 25, name: "Local 25 - Lanús", shortName: "L25 Lanús", address: "9 de Julio 1200", zone: "GBA Sur", phone: "+54 9 11 4241-1025", manager: "Sabrina Cabrera", whatsappGroup: "TBEST - L25 Lanús", baseEf: 370000, baseDig: 460000, color: "border-l-rose-500" },
  { id: "local-26", number: 26, name: "Local 26 - Lomas de Zamora", shortName: "L26 Lomas", address: "Peatonal Laprida 300", zone: "GBA Sur", phone: "+54 9 11 4243-1026", manager: "Pablo Coronel", whatsappGroup: "TBEST - L26 Lomas", baseEf: 430000, baseDig: 550000, color: "border-l-sky-500" },
  { id: "local-27", number: 27, name: "Local 27 - Banfield", shortName: "L27 Banfield", address: "Maipú 200", zone: "GBA Sur", phone: "+54 9 11 4242-1027", manager: "Julieta Romero", whatsappGroup: "TBEST - L27 Banfield", baseEf: 320000, baseDig: 440000, color: "border-l-teal-500" },
  { id: "local-28", number: 28, name: "Local 28 - Temperley", shortName: "L28 Temperley", address: "Av. Almirante Brown 3100", zone: "GBA Sur", phone: "+54 9 11 4244-1028", manager: "Esteban Varela", whatsappGroup: "TBEST - L28 Temperley", baseEf: 310000, baseDig: 410000, color: "border-l-yellow-500" },
  { id: "local-29", number: 29, name: "Local 29 - Callao 1", shortName: "L29 Callao 1", address: "Av. Callao 100", zone: "CABA", phone: "+54 9 11 4629-1029", manager: "Luciano Giménez", whatsappGroup: "TBEST - L29 Callao 1", baseEf: 400000, baseDig: 490000, color: "border-l-emerald-500" },
  { id: "local-30", number: 30, name: "Local 30 - Ramos Mejía", shortName: "L30 Ramos", address: "Av. de Mayo 600", zone: "GBA Oeste", phone: "+54 9 11 4658-1030", manager: "Rocío Carrizo", whatsappGroup: "TBEST - L30 Ramos", baseEf: 420000, baseDig: 580000, color: "border-l-purple-500" },
  { id: "local-31", number: 31, name: "Local 31 - Castelar", shortName: "L31 Castelar", address: "Carlos Casares 900", zone: "GBA Oeste", phone: "+54 9 11 4627-1031", manager: "Guillermo Ponce", whatsappGroup: "TBEST - L31 Castelar", baseEf: 360000, baseDig: 490000, color: "border-l-blue-500" },
  { id: "local-32", number: 32, name: "Local 32 - Ituzaingó", shortName: "L32 Ituzaingó", address: "Las Heras 200", zone: "GBA Oeste", phone: "+54 9 11 4624-1032", manager: "Daniela Godoy", whatsappGroup: "TBEST - L32 Ituzaingó", baseEf: 330000, baseDig: 420000, color: "border-l-amber-500" },
  { id: "local-33", number: 33, name: "Local 33 - San Justo", shortName: "L33 San Justo", address: "Arieta 3200", zone: "GBA Oeste", phone: "+54 9 11 4651-1033", manager: "Rodrigo Morales", whatsappGroup: "TBEST - L33 San Justo", baseEf: 440000, baseDig: 510000, color: "border-l-cyan-500" },
  { id: "local-34", number: 34, name: "Local 34 - Merlo", shortName: "L34 Merlo", address: "Av. del Libertador 500", zone: "GBA Oeste", phone: "+54 9 11 4821-1034", manager: "Carla Ibarra", whatsappGroup: "TBEST - L34 Merlo", baseEf: 380000, baseDig: 430000, color: "border-l-pink-500" },
  { id: "local-35", number: 35, name: "Local 35 - Callao 2", shortName: "L35 Callao 2", address: "Av. Callao 800", zone: "CABA", phone: "+54 9 11 4620-1035", manager: "Mariano Ríos", whatsappGroup: "TBEST - L35 Callao 2", baseEf: 390000, baseDig: 420000, color: "border-l-indigo-500" },
  { id: "local-36", number: 36, name: "Local 36 - Pilar", shortName: "L36 Pilar", address: "Peatonal Rivadavia 600", zone: "GBA Norte", phone: "+54 9 11 4230-1036", manager: "Brenda Acosta", whatsappGroup: "TBEST - L36 Pilar", baseEf: 450000, baseDig: 640000, color: "border-l-slate-500" },
  { id: "local-37", number: 37, name: "Local 37 - Ezeiza", shortName: "L37 Ezeiza", address: "Paso de la Patria 200", zone: "GBA Sur", phone: "+54 9 11 4295-1037", manager: "Alexis Ferrari", whatsappGroup: "TBEST - L37 Ezeiza", baseEf: 310000, baseDig: 390000, color: "border-l-fuchsia-500" },
  { id: "local-38", number: 38, name: "Local 38 - San Fernando", shortName: "L38 San Fernando", address: "Constitución 900", zone: "GBA Norte", phone: "+54 9 11 4744-1038", manager: "Nadia Benítez", whatsappGroup: "TBEST - L38 San Fernando", baseEf: 350000, baseDig: 470000, color: "border-l-lime-500" }
];

export const TOTAL_NETWORK_BRANCHES = MASTER_38_BRANCHES.length; // Exactly 38

export const SPECIAL_LOGISTIC_CONTACTS = [
  { id: "deposito-central", name: "Depósito Central & Logística Tbest", phone: "+54 9 11 5120-9900", manager: "Pedro Gómez (Jefe Logística)" },
  { id: "proveedor-distribuidora", name: "Distribuidora Mayorista de Bebidas", phone: "+54 9 11 6399-4411", manager: "Distribuidor Oficial" }
];
