import { Request, Response } from "express";
import Item from "../models/Item";

// Create a new item
export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, price, category, description } = req.body;
    const newItem = await Item.create({ name, price, category, description });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Error creating item", error });
  }
};

// Get all items
export const getItems = async (_req: Request, res: Response) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
};
