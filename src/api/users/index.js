import express from "express";
const router = express.Router();
import { validator } from "../../helper/common/validator.js";
import authMiddleware from "../../helper/common/jwtMiddelware.js";
import {
    userLogin,
    userRegister
} from "./controller.js";

router.post("/userRegister", validator("registerValidation"), userRegister);
router.post("/userLogin", authMiddleware, validator("userLogin"), userLogin);

export default router;