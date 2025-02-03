import express from "express";
import { createItem, getItems } from "../controllers/itemController";

const router = express.Router();

router.post("/", createItem); // Create a new item
router.get("/", getItems);   // Get all items

export default router;
