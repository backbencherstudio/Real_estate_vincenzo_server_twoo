

import { Router } from "express";
import { stripePaymentService } from "./payment.stripe";

const router = Router()

router.post("/stripe", stripePaymentService.stripePayment);



export const StripePaymentRoutes = router