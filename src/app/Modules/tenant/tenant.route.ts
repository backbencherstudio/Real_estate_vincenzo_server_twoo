import express from 'express';
import { User_Role } from '../User/user.constent';
import { Auth } from '../../middleware/auth';
import { tenantController } from './tenant.controller';


const router = express.Router();

router.get(
    '/:id',
    Auth(User_Role.tenant),
    tenantController.getTenantDetails,
);



export const TenantRouter = router;