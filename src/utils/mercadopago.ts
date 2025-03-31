import { MercadoPagoConfig, Preapproval } from "@mercadopago/mercadopago";

const mp = new MercadoPagoConfig({
  access_token: process.env.MERCADO_PAGO_API_KEY,
});

export const createSubscription = async (user: any) => {
  const preapproval: Preapproval = {
    payer_email: "user.email", // Necesitas obtener el email del usuario
    reason: "Suscripción a FinanzApp",
    external_reference: user._id,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: 10,
      currency_id: "ARS",
    },
    back_url: "http://localhost:3000/dashboard",
  };

  const response = await mp.preapproval.create(preapproval);
  return response.init_point;
};