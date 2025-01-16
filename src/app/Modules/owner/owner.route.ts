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



export const OwnerRouter = router;
