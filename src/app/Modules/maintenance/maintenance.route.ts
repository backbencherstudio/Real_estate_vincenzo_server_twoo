import { Router } from "express";
import { Auth } from "../../middleware/auth";
import { User_Role } from "../User/user.constent";
import { upload } from "../../middleware/upload";
import { maintenanceController } from "./maintenance.controller";

const router = Router()

router.post("/", Auth(User_Role.tenant), 
upload.array('image', 1), 
maintenanceController.createMaintenance);

router.get("/:id", Auth(User_Role.tenant, User_Role.owner), maintenanceController.getAllMaintenanceRequest )

export const MaintenanceRoutes = router