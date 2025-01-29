

import { Router } from "express";
import { stripePaymentService } from "./payment.stripe";
import bodyParser from "body-parser";
import { paymentController } from "./payment.controller";

const router = Router()

router.get("/tenantPayment", paymentController.createALlTenantsForPayment);
router.get("/getAllTenantPaymentData", paymentController.getAllTenantPaymentData);
router.get("/getSingleUserAllPaymentData/:userId", paymentController.getSingleUserAllPaymentData);


// ====================== Stripe Payment Handle API
router.post("/stripe", stripePaymentService.stripePayment);
router.post("/cancel-subscription/:customerId", stripePaymentService.cancelSubscription);
router.post("/Webhook", bodyParser.raw({ type: "application/json" }), stripePaymentService.Webhook);


export const StripePaymentRoutes = router