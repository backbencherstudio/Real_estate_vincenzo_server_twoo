import express from 'express';
import { UserRouter } from '../Modules/User/user.route';
import { OwnerRouter } from '../Modules/owner/owner.route';
import { AdminRouter } from '../Modules/admin/admin.route';
import { TenantRouter } from '../Modules/tenant/tenant.route';
import { MaintenanceRoutes } from '../Modules/maintenance/maintenance.route';
import { DocumentRoutes } from '../Modules/document/document.route';
import { StripePaymentRoutes } from '../Modules/payment/payment.route';
const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: UserRouter },
  { path: '/admin', route: AdminRouter },
  { path: '/owner', route: OwnerRouter },
  { path: '/tenant', route: TenantRouter },
  { path: '/maintenance', route: MaintenanceRoutes },
  { path: '/document', route: DocumentRoutes },
  { path: '/payment', route: StripePaymentRoutes},

];

moduleRoutes.forEach((pathRouter) =>
  router.use(pathRouter.path, pathRouter.route),
);

export default router;
