import express from 'express';
import { AdminController } from './admin.controller';
import { Auth } from '../../middleware/auth';
import { User_Role } from '../User/user.constent';
import { upload } from '../../middleware/upload';

const router = express.Router()

router.get("/getAllProterties",
    Auth(User_Role.admin),
    AdminController.getALlProperties
);

router.get(
    '/propertie-units/:id',
    Auth(User_Role.owner, User_Role.admin),
    AdminController.getEachPropertyAllUnits,
);

router.get(
    '/getALlTenants',
    Auth(User_Role.admin),
    AdminController.getALlTenants,
);

router.get(
    '/getSingleTenantDetailse/:id',
    Auth(User_Role.admin, User_Role.owner),
    AdminController.getSingleTenantDetailse,
);

router.get(
    '/getSingleOwnerAllPropertiesWithOwnerInfo/:id',
    Auth(User_Role.admin),
    AdminController.getSingleOwnerAllPropertiesWithOwnerInfo,
);

router.get(
    '/getAllDataOverviewByAdmin',
    Auth(User_Role.admin),
    AdminController.getAllDataOverviewByAdmin,
);

router.post(
    '/createPlan',
    Auth(User_Role.admin),
    AdminController.createPlan,
);

router.get(
    '/getPlan',
    AdminController.getPlan,
);
router.delete(
    '/deleteNoSubscriberOwner/:ownerId',
    AdminController.deleteNoSubscriberOwner,
);

router.post(
    '/realEstateAdvisor',
     upload.array('image', 1),
    AdminController.realEstateAdvisor,
);
router.delete(
    '/realEstateAdvisordelete/:id',
    AdminController.realEstateAdvisordelete,
);

router.get(
    '/getAllReview',
    AdminController.getAllReview,
);
router.delete(
    '/deleteReviewByAdmin/:reviewId',
    AdminController.deleteReviewByAdmin,
);

router.get(
    '/getAllEmailCollectionData',
    Auth(User_Role.admin),
    AdminController.getAllEmailCollectionData,
);
router.delete(
    '/deleteEmailCollectionData/:emailId',
    Auth(User_Role.admin),
    AdminController.deleteEmailCollectionData,
);

router.post(
    '/addTransactionData',
    Auth(User_Role.admin),
    AdminController.addTransactionDataController,
);

router.get(
    '/payment-history',
    Auth(User_Role.admin),
    AdminController.getTransferData,
);



export const AdminRouter = router