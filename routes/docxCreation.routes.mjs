import express from "express";
import docxController from "../controller/docxController.mjs";

const router = express.Router();

router.get("/CreateFiles", docxController.CreateDocx);

export default router;
