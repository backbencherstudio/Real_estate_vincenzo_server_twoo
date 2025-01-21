import { Router } from "express";
import { Auth } from "../../middleware/auth";
import { User_Role } from "../User/user.constent";
import { upload } from "../../middleware/upload";
import { doculmentController } from "./document.controller";
const router = Router()

router.post("/", Auth(User_Role.tenant),
upload.array('image', 1),
doculmentController.createDocument);

router.get("/:ownerId", Auth(User_Role.owner), doculmentController.getSingleOwnerAllDocuments)
router.get("/singleDocument/:documentId", Auth(User_Role.owner), doculmentController.getSingleDocument)
router.get("/singleUserAllDocuments/:userId", Auth(User_Role.tenant, User_Role.owner), doculmentController.getSingleUserAllDocuments)
router.get("/findSingleTenentDocumentByOwner/:tenantId", Auth(User_Role.tenant, User_Role.owner), doculmentController.findSingleTenentDocumentByOwner)


export const DocumentRoutes = router