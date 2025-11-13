import { Router } from 'express';
import prisma from '../prisma.js';
import { Prisma } from '@prisma/client';

const router = Router();

// GET /api/cash-movements - Lista tutte le movimentazioni denaro
router.get('/', async (req, res) => {
  try {
    const { cashRegisterId, limit } = req.query;
    const where: Prisma.CashMovementWhereInput = {};
    
    if (cashRegisterId) where.cashRegisterId = cashRegisterId as string;

    const movements = await prisma.cashMovement.findMany({
      where,
      include: {
        cashRegister: true,
      },
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero delle movimentazioni' });
  }
});

// POST /api/cash-movements - Crea nuova movimentazione denaro
router.post('/', async (req, res) => {
  try {
    const { cashRegisterId, type, amount, description, date } = req.body;

    if (!cashRegisterId || !type || !amount) {
      return res.status(400).json({ 
        error: 'cashRegisterId, type e amount sono obbligatori' 
      });
    }

    if (type !== 'IN' && type !== 'OUT') {
      return res.status(400).json({ error: 'type deve essere IN o OUT' });
    }

    // Verifica che la cassa esista
    const cashRegister = await prisma.cashRegister.findUnique({
      where: { id: cashRegisterId },
    });

    if (!cashRegister) {
      return res.status(404).json({ error: 'Cassa non trovata' });
    }

    // Crea la movimentazione e aggiorna il saldo in una transazione
    const result = await prisma.$transaction(async (tx) => {
      // Crea la movimentazione
      const movement = await tx.cashMovement.create({
        data: {
          cashRegisterId,
          type,
          amount: parseFloat(amount),
          description,
          date: date ? new Date(date) : new Date(),
        },
      });

      // Aggiorna il saldo della cassa
      const currentBalanceNum = parseFloat(cashRegister.currentBalance.toString());
      const amountNum = parseFloat(amount);
      const newBalance = type === 'IN' 
        ? currentBalanceNum + amountNum
        : currentBalanceNum - amountNum;

      // Verifica che il saldo non diventi negativo
      if (newBalance < 0) {
        throw new Error('Saldo insufficiente nella cassa');
      }

      await tx.cashRegister.update({
        where: { id: cashRegisterId },
        data: { currentBalance: newBalance },
      });

      return movement;
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Saldo insufficiente nella cassa') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Errore nella creazione della movimentazione' });
  }
});

export default router;

