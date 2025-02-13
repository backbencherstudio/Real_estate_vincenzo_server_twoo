import express from 'express';
import { Auth } from '../../middleware/auth';
import { propertyController } from './owner.controller';
import { User_Role } from '../User/user.constent';
import { upload } from '../../middleware/upload';

const router = express.Router();

router.post(
    '/create-properties',
    Auth(User_Role.owner),
    upload.array('propertyImages', 10), 
    propertyController.createProperties
  );
  
router.get(
    '/:id',
    Auth(User_Role.owner),
    propertyController.getSingleOwnerAllProperties,
);

router.post(
    '/create-unit',
    Auth(User_Role.owner),
    propertyController.createUnits,
);

// =================== admin and owner both can access this route
router.get(
    '/propertie-units/:id',
    Auth(User_Role.owner, User_Role.admin),
    propertyController.getEachPropertyAllUnits,
);

router.post(
    '/create-tenant',
    Auth(User_Role.owner),
    propertyController.createTenant,
);

router.delete(
    "/delete-tenant/:tenantId",
    Auth(User_Role.owner),
    propertyController.deleteTenant,
);

router.get( 
    '/unit/:id',
    Auth(User_Role.owner),
    propertyController.getAllTenants,
);

router.get(
    '/singleUnit/:id',
    Auth(User_Role.owner),
    propertyController.getSingleUnit,
);

router.get(
    '/singleTenant/:id',
    Auth(User_Role.owner),
    propertyController.getSingleTenant,
);

router.get(
    '/maintenanceData/:ownerId',
    Auth(User_Role.owner),
    propertyController.getEachOwnerAllMaintenanceRequestData,
);

router.get(
    '/singleMaintenanceData/:maintainId',
    Auth(User_Role.owner, User_Role.tenant),
    propertyController.getSingleMaintenanceRequestData,
);

router.patch(
    '/singleMaintenanceData/:maintainId',
    Auth(User_Role.owner),
    propertyController.maintenanceStatusChenge,
);

router.get(
    '/getAllDataOverviewByOwner/:ownerId',
    Auth(User_Role.owner),
    propertyController.getAllDataOverviewByOwner,
);

router.get(
    '/getResentPaymentDataByOwner/:ownerId',
    Auth(User_Role.owner),
    propertyController.getResentPaymentDataByOwner,
);

router.get(
    '/getPaymentDataOverviewByOwner/:ownerId',
    Auth(User_Role.owner),
    propertyController.getPaymentDataOverviewByOwner,
);

router.get(
    '/getAllTenantsForMessage/:ownerId',
    Auth(User_Role.owner),
    propertyController.getAllTenantsForMessage,
);


export const OwnerRouter = router;
