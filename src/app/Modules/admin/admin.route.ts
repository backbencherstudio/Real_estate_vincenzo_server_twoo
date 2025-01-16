import express from 'express';
import { AdminController } from './admin.controller';
import { Auth } from '../../middleware/auth';
import { User_Role } from '../User/user.constent';

const router = express.Router()

router.get("/getAllProterties" , Auth(User_Role.admin), AdminController.getALlProperties );

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
    Auth(User_Role.admin),
    AdminController.getSingleTenantDetailse,
);

router.get(
    '/getSingleOwnerAllPropertiesWithOwnerInfo/:id',
    Auth(User_Role.admin),
    AdminController.getSingleOwnerAllPropertiesWithOwnerInfo,
);



export const AdminRouter = router