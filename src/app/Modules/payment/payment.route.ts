

import { Router } from "express";
import { stripePaymentService } from "./payment.stripe";
import bodyParser from "body-parser";

const router = Router()

router.post("/stripe", stripePaymentService.stripePayment);
router.post("/Webhook", bodyParser.raw({ type: "application/json" }), stripePaymentService.Webhook);



export const StripePaymentRoutes = router