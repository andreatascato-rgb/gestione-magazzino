import { Router } from 'express';
import prisma from '../prisma.js';
import { Prisma } from '@prisma/client';

const router = Router();

// GET /api/stock-movements - Lista tutte le movimentazioni merce
router.get('/', async (req, res) => {
  try {
    const { productId, warehouseId, limit } = req.query;
    const where: Prisma.StockMovementWhereInput = {};
    
    if (productId) where.productId = productId as string;
    if (warehouseId) where.warehouseId = warehouseId as string;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero delle movimentazioni' });
  }
});

// POST /api/stock-movements - Crea nuova movimentazione merce
router.post('/', async (req, res) => {
  try {
    const { productId, warehouseId, type, quantity, reason, date } = req.body;

    if (!productId || !warehouseId || !type || !quantity) {
      return res.status(400).json({ 
        error: 'productId, warehouseId, type e quantity sono obbligatori' 
      });
    }

    if (type !== 'IN' && type !== 'OUT') {
      return res.status(400).json({ error: 'type deve essere IN o OUT' });
    }

    // Verifica che prodotto e magazzino esistano
    const [product, warehouse] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.warehouse.findUnique({ where: { id: warehouseId } }),
    ]);

    if (!product || !warehouse) {
      return res.status(404).json({ error: 'Prodotto o magazzino non trovato' });
    }

    // Crea la movimentazione e aggiorna il livello di scorta in una transazione
    const result = await prisma.$transaction(async (tx) => {
      // Crea la movimentazione
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          warehouseId,
          type,
          quantity: parseInt(quantity),
          reason,
          date: date ? new Date(date) : new Date(),
        },
      });

      // Trova o crea il livello di scorta
      const stockLevel = await tx.stockLevel.upsert({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId,
          },
        },
        update: {
          quantity: {
            increment: type === 'IN' ? parseInt(quantity) : -parseInt(quantity),
          },
        },
        create: {
          productId,
          warehouseId,
          quantity: type === 'IN' ? parseInt(quantity) : -parseInt(quantity),
        },
      });

      // Verifica che la quantità non diventi negativa
      if (stockLevel.quantity < 0) {
        throw new Error('Quantità insufficiente in magazzino');
      }

      return movement;
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Quantità insufficiente in magazzino') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Errore nella creazione della movimentazione' });
  }
});

export default router;

