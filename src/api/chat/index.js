import express from "express";
const router = express.Router();
import { validator } from "../../helper/common/validator.js";
import authMiddleware from "../../helper/common/jwtMiddelware.js";
import {
    sendMessage,
} from "./controller.js";

router.post("/sendMessage", sendMessage);

export default router;