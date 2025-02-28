

import { Router } from "express";
import { stripePaymentService } from "./payment.stripe";
import bodyParser from "body-parser";
import { paymentController } from "./payment.controller";
import { Auth } from "../../middleware/auth";
import { User_Role } from "../User/user.constent";

const router = Router()

router.post("/stripeTenantPayment", paymentController.stripeTenantPayment);
router.get("/tenantPayment", paymentController.createALlTenantsForPayment);  // running month payment create API
router.get("/getAllTenantPaymentData", paymentController.getAllTenantPaymentData);
router.get("/getSingleUserAllPaymentData/:userId", paymentController.getSingleUserAllPaymentData);


// =========================== Stripe Payment Handle API
router.post("/stripe", stripePaymentService.stripePayment);
router.post("/cancel-subscription/:customerId", stripePaymentService.cancelSubscription);
router.post("/webhook", bodyParser.raw({ type: "application/json" }), stripePaymentService.Webhook);



// ============================ Stripe PayOut API
router.post("/placedPayoutData", paymentController.createPayoutByOwner);
router.get("/payoutDataGetByAdmin", paymentController.getPayoutDataByAdmin);


// ============================ get payout all data for single owner
router.get(
    '/getPayoutDataBySingleOwner/:ownerId',
    Auth(User_Role.owner),
    paymentController.getPayoutDataBySingleOwner,
);


// ============================ send Payout Request By owner
router.post(
    '/sendPayoutRequestByOwnerToStripe',
    Auth(User_Role.owner),
    paymentController.sendPayoutRequestByOwnerToStripe,
);


// ============================ send Payout Request By owner
router.post(
    '/sendPayoutRequestByAdmin',
    Auth(User_Role.admin),
    paymentController.sendPayoutRequestByAdmin,
);


export const StripePaymentRoutes = router