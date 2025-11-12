import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET /api/cash-registers - Lista tutte le casse
router.get('/', async (req, res) => {
  try {
    const cashRegisters = await prisma.cashRegister.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(cashRegisters);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero delle casse' });
  }
});

// GET /api/cash-registers/:id - Dettaglio cassa
router.get('/:id', async (req, res) => {
  try {
    const cashRegister = await prisma.cashRegister.findUnique({
      where: { id: req.params.id },
      include: {
        cashMovements: {
          orderBy: { date: 'desc' },
          take: 50, // Ultimi 50 movimenti
        },
      },
    });
    if (!cashRegister) {
      return res.status(404).json({ error: 'Cassa non trovata' });
    }
    res.json(cashRegister);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero della cassa' });
  }
});

// POST /api/cash-registers - Crea nuova cassa
router.post('/', async (req, res) => {
  try {
    const { name, initialBalance } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Il nome è obbligatorio' });
    }
    const balance = initialBalance ? parseFloat(initialBalance) : 0;
    const cashRegister = await prisma.cashRegister.create({
      data: {
        name,
        initialBalance: balance,
        currentBalance: balance,
      },
    });
    res.status(201).json(cashRegister);
  } catch (error) {
    res.status(500).json({ error: 'Errore nella creazione della cassa' });
  }
});

// PUT /api/cash-registers/:id - Aggiorna cassa
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const cashRegister = await prisma.cashRegister.update({
      where: { id: req.params.id },
      data: { name },
    });
    res.json(cashRegister);
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'aggiornamento della cassa' });
  }
});

// DELETE /api/cash-registers/:id - Elimina cassa
router.delete('/:id', async (req, res) => {
  try {
    await prisma.cashRegister.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'eliminazione della cassa' });
  }
});

export default router;

