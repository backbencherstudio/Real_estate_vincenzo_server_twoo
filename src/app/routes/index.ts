import express from 'express';
import { UserRouter } from '../Modules/User/user.route';
import { OwnerRouter } from '../Modules/owner/owner.route';
import { AdminRouter } from '../Modules/admin/admin.route';
import { TenantRouter } from '../Modules/tenant/tenant.route';
const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: UserRouter },
  { path: '/admin', route: AdminRouter },
  { path: '/owner', route: OwnerRouter },
  { path: '/tenant', route: TenantRouter },
];

moduleRoutes.forEach((pathRouter) =>
  router.use(pathRouter.path, pathRouter.route),
);

export default router;
