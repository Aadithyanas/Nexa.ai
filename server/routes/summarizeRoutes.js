import express from "express";
import { summarizeVideo } from "../controller/summarizeController.js";

const router = express.Router();

router.post("/summarize", summarizeVideo);

export default router;
