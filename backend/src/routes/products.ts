import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET /api/products - Lista tutti i prodotti
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        stockLevels: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dei prodotti' });
  }
});

// GET /api/products/:id - Dettaglio prodotto
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        stockLevels: {
          include: {
            warehouse: true,
          },
        },
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Prodotto non trovato' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero del prodotto' });
  }
});

// POST /api/products - Crea nuovo prodotto
router.post('/', async (req, res) => {
  try {
    const { name, description, sku, price } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Il nome è obbligatorio' });
    }
    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        price: price ? parseFloat(price) : 0,
      },
    });
    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'SKU già esistente' });
    }
    res.status(500).json({ error: 'Errore nella creazione del prodotto' });
  }
});

// PUT /api/products/:id - Aggiorna prodotto
router.put('/:id', async (req, res) => {
  try {
    const { name, description, sku, price } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        sku,
        price: price !== undefined ? parseFloat(price) : undefined,
      },
    });
    res.json(product);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'SKU già esistente' });
    }
    res.status(500).json({ error: 'Errore nell\'aggiornamento del prodotto' });
  }
});

// DELETE /api/products/:id - Elimina prodotto
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'eliminazione del prodotto' });
  }
});

export default router;

