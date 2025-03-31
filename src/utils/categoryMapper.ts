// backend/src/utils/categoryMapper.ts

// Mapeo de palabras clave a categorías predefinidas
export const CATEGORY_MAPPING: { [key: string]: string } = {
    // Categoría: combustible
    yfp: "combustible",
    shell: "combustible",
    nafta: "combustible",
    gasolina: "combustible",
    combustible: "combustible",
    // Categoría: panaderia
    pan: "panaderia",
    facturas: "panaderia",
    medialunas: "panaderia",
    panaderia: "panaderia",
    // Categoría: supermercado
    supermercado: "supermercado",
    coto: "supermercado",
    carrefour: "supermercado",
    compras: "supermercado",
    // Categoría: comida
    comida: "comida",
    restaurante: "comida",
    delivery: "comida",
    // Categoría: transporte
    transporte: "transporte",
    colectivo: "transporte",
    subte: "transporte",
    taxi: "transporte",
    uber: "transporte",
    // Categoría: entretenimiento
    entretenimiento: "entretenimiento",
    cine: "entretenimiento",
    teatro: "entretenimiento",
    netflix: "entretenimiento",
    // Categoría: salud
    salud: "salud",
    farmacia: "salud",
    medico: "salud",
    hospital: "salud",
    // Categoría: educacion
    educacion: "educacion",
    escuela: "educacion",
    universidad: "educacion",
    libros: "educacion",
    // Categoría: hogar
    hogar: "hogar",
    alquiler: "hogar",
    servicios: "hogar",
    luz: "hogar",
    gas: "hogar",
    agua: "hogar",
    // Categoría: ropa
    ropa: "ropa",
    zapatillas: "ropa",
    remera: "ropa",
    pantalon: "ropa",
    // Categoría: tecnologia
    tecnologia: "tecnologia",
    celular: "tecnologia",
    computadora: "tecnologia",
    auriculares: "tecnologia",
    // Categoría: otros
    otros: "otros",
  };
  
  // Lista de categorías predefinidas (para validación)
  export const EXPENSE_CATEGORIES = [
    "combustible",
    "panaderia",
    "supermercado",
    "comida",
    "transporte",
    "entretenimiento",
    "salud",
    "educacion",
    "hogar",
    "ropa",
    "tecnologia",
    "otros",
  ];
  
  // Función para mapear la categoría ingresada a una categoría predefinida
  export const mapCategory = (inputCategory: string): string => {
    const normalizedInput = inputCategory.toLowerCase();
    return CATEGORY_MAPPING[normalizedInput] || "otros"; // Si no se encuentra, se asigna a "otros"
  };