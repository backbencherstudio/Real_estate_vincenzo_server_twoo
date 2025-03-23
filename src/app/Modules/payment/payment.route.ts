

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


// =========================== ACH Payment For Tenant ========================
router.post("/createCustomerForACHpayment", paymentController.createCustomerForACHpayment);
router.post("/createBankTokenForACHpayment", paymentController.createBankTokenForACHpayment);
router.post("/attachACHbankAccount", paymentController.attachACHbankAccount);
router.post("/verifyBankAccount", paymentController.verifyBankAccount);
router.post("/payRentUserACHcontroller", paymentController.payRentUserACHcontroller);



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


// ================================= plan 
router.post(
    '/planController',
    Auth(User_Role.owner),
    paymentController.planController,  
);


export const StripePaymentRoutes = router