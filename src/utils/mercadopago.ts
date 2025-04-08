// src/utils/mercadopago.ts
import { MercadoPagoConfig, PreApproval } from "mercadopago";

// Configurar el cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
  options: { timeout: 5000 },
});

export const createPreApproval = async (preApprovalData: any) => {
  try {
    const preApproval = new PreApproval(client);
    const result = await preApproval.create({ body: preApprovalData });
    return result;
  } catch (error) {
    console.error("Error al crear el preapproval:", error);
    throw error;
  }
};