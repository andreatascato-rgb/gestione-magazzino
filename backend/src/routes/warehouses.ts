import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET /api/warehouses - Lista tutti i magazzini
router.get('/', async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dei magazzini' });
  }
});

// GET /api/warehouses/:id - Dettaglio magazzino
router.get('/:id', async (req, res) => {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: req.params.id },
      include: {
        stockLevels: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!warehouse) {
      return res.status(404).json({ error: 'Magazzino non trovato' });
    }
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero del magazzino' });
  }
});

// POST /api/warehouses - Crea nuovo magazzino
router.post('/', async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Il nome è obbligatorio' });
    }
    const warehouse = await prisma.warehouse.create({
      data: { name, address },
    });
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ error: 'Errore nella creazione del magazzino' });
  }
});

// PUT /api/warehouses/:id - Aggiorna magazzino
router.put('/:id', async (req, res) => {
  try {
    const { name, address } = req.body;
    const warehouse = await prisma.warehouse.update({
      where: { id: req.params.id },
      data: { name, address },
    });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'aggiornamento del magazzino' });
  }
});

// DELETE /api/warehouses/:id - Elimina magazzino
router.delete('/:id', async (req, res) => {
  try {
    await prisma.warehouse.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'eliminazione del magazzino' });
  }
});

export default router;

