// backend/src/controllers/subscriptionController.ts
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { User, IUser } from "../models/User";

// Create a subscription (e.g., for Mercado Pago or Stripe)
export const createSubscription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id; // Assuming user is set by authMiddleware

  if (!userId) {
    res.status(401).json({ msg: "Usuario no autenticado" });
    return;
  }

  const user: IUser | null = await User.findById(userId);
  if (!user) {
    res.status(404).json({ msg: "Usuario no encontrado" });
    return;
  }

  // Example: Create a subscription with a payment provider (e.g., Mercado Pago)
  const subscriptionData = {
    // Replace with actual payment provider fields
    plan_id: "your-plan-id",
    external_reference: user._id.toString(), // Now properly typed as IUser has _id
    // Add other required fields for the payment provider
  };

  // Simulate a call to the payment provider (replace with actual API call)
  const subscriptionResponse = {
    id: "sub_12345", // Simulated subscription ID
    status: "active",
  };

  // Update the user's subscription details
  const subscriptionId = subscriptionResponse.id;
  user.subscriptionStatus = "active";
  user.subscriptionId = subscriptionId;
  user.trialEndDate = null; // Reset trial end date since subscription is active

  await user.save();

  res.status(200).json({ msg: "Suscripción creada exitosamente", subscriptionId });
});

// Handle subscription webhook (e.g., from Mercado Pago or Stripe)
export const handleSubscriptionWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { subscriptionId, status } = req.body; // Adjust based on actual webhook payload

  const user: IUser | null = await User.findOne({ subscriptionId });
  if (!user) {
    res.status(404).json({ msg: "Usuario no encontrado" });
    return;
  }

  // Update subscription status based on webhook data
  user.subscriptionStatus = status === "active" ? "active" : "inactive";
  if (status !== "active") {
    user.trialEndDate = null; // Reset trial end date if subscription is not active
  }

  await user.save();

  res.status(200).json({ msg: "Webhook procesado exitosamente" });
});