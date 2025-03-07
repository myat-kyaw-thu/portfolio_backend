
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all items (public)
router.get('/', async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET item by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new item (requires API key)
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newItem = await prisma.item.create({
      data: {
        title,
        description
      }
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update item (requires API key)
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const id = parseInt(req.params.id);
    
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        title,
        description
      }
    });
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE item (requires API key)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.item.delete({
      where: { id }
    });
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
