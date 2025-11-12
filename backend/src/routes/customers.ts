import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET /api/customers - Lista tutti i clienti
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dei clienti' });
  }
});

// GET /api/customers/:id - Dettaglio cliente
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero del cliente' });
  }
});

// POST /api/customers - Crea nuovo cliente
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Il nome è obbligatorio' });
    }
    const customer = await prisma.customer.create({
      data: { name, email, phone, address },
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Errore nella creazione del cliente' });
  }
});

// PUT /api/customers/:id - Aggiorna cliente
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, email, phone, address },
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'aggiornamento del cliente' });
  }
});

// DELETE /api/customers/:id - Elimina cliente
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'eliminazione del cliente' });
  }
});

export default router;

