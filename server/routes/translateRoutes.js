// routes/translateRoutes.js
import express from "express";
import { translate } from "../controller/translateController.js";

const router = express.Router();

router.post("/translate", translate);

export default router;
