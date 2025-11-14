import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// Funzione per generare ID nel formato C-XXX (3 numeri random)
function generateCustomerId(): string {
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `C-${randomNum}`;
}

// Funzione per verificare se un ID esiste già
async function idExists(id: string): Promise<boolean> {
  const customer = await prisma.customer.findUnique({
    where: { id },
  });
  return customer !== null;
}

// Funzione per generare un ID unico
async function generateUniqueId(): Promise<string> {
  let id = generateCustomerId();
  let attempts = 0;
  while (await idExists(id) && attempts < 100) {
    id = generateCustomerId();
    attempts++;
  }
  if (attempts >= 100) {
    throw new Error('Impossibile generare un ID unico per il cliente');
  }
  return id;
}

// GET /api/customers - Lista tutti i clienti
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        referral: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            referredBy: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Converti Decimal a number e DateTime a string per il frontend
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      spesa: parseFloat(customer.spesa.toString()),
      debito: parseFloat(customer.debito.toString()),
      ultimoDeal: customer.ultimoDeal ? customer.ultimoDeal.toISOString() : null,
      referralId: customer.referralId,
      referral: customer.referral,
      referredByCount: customer._count.referredBy,
      attivo: customer.attivo,
      isReferral: customer.isReferral,
      referralColor: customer.referralColor,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    }));
    
    res.json(formattedCustomers);
  } catch (error) {
    console.error('Error loading customers:', error);
    res.status(500).json({ error: 'Errore nel recupero dei clienti' });
  }
});

// GET /api/customers/:id - Dettaglio cliente
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        referral: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            referredBy: true,
          },
        },
      },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }
    
    // Converti Decimal a number e DateTime a string per il frontend
    const formattedCustomer = {
      id: customer.id,
      name: customer.name,
      spesa: parseFloat(customer.spesa.toString()),
      debito: parseFloat(customer.debito.toString()),
      ultimoDeal: customer.ultimoDeal ? customer.ultimoDeal.toISOString() : null,
      referralId: customer.referralId,
      referral: customer.referral,
      referredByCount: customer._count.referredBy,
      attivo: customer.attivo,
      isReferral: customer.isReferral,
      referralColor: customer.referralColor,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
    
    res.json(formattedCustomer);
  } catch (error) {
    console.error('Error loading customer:', error);
    res.status(500).json({ error: 'Errore nel recupero del cliente' });
  }
});

// POST /api/customers - Crea nuovo cliente
router.post('/', async (req, res) => {
  try {
    const { name, spesa, ultimoDeal, referralId, attivo } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Il nome è obbligatorio' });
    }
    
    // Genera ID unico
    const id = await generateUniqueId();
    
    // Verifica che il referral esista se fornito
    if (referralId) {
      const referral = await prisma.customer.findUnique({
        where: { id: referralId },
      });
      if (!referral) {
        return res.status(400).json({ error: 'Cliente referral non trovato' });
      }
    }
    
    const customer = await prisma.customer.create({
      data: {
        id,
        name,
        spesa: spesa ? parseFloat(spesa) : 0,
        ultimoDeal: ultimoDeal ? new Date(ultimoDeal) : null,
        referralId: referralId || null,
        attivo: attivo !== undefined ? attivo : true,
      },
      include: {
        referral: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            referredBy: true,
          },
        },
      },
    });
    
    // Converti Decimal a number e DateTime a string per il frontend
    const formattedCustomer = {
      id: customer.id,
      name: customer.name,
      spesa: parseFloat(customer.spesa.toString()),
      debito: parseFloat(customer.debito.toString()),
      ultimoDeal: customer.ultimoDeal ? customer.ultimoDeal.toISOString() : null,
      referralId: customer.referralId,
      referral: customer.referral,
      referredByCount: customer._count.referredBy,
      attivo: customer.attivo,
      isReferral: customer.isReferral,
      referralColor: customer.referralColor,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
    
    res.status(201).json(formattedCustomer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Errore nella creazione del cliente' });
  }
});

// PUT /api/customers/:id - Aggiorna cliente
router.put('/:id', async (req, res) => {
  try {
    const { name, spesa, ultimoDeal, referralId, attivo } = req.body;
    
    // Verifica che il referral esista se fornito
    if (referralId) {
      const referral = await prisma.customer.findUnique({
        where: { id: referralId },
      });
      if (!referral) {
        return res.status(400).json({ error: 'Cliente referral non trovato' });
      }
      // Verifica che il referral non sia il cliente stesso
      if (referralId === req.params.id) {
        return res.status(400).json({ error: 'Un cliente non può riferire sé stesso' });
      }
    }
    
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name,
        spesa: spesa !== undefined ? parseFloat(spesa) : undefined,
        ultimoDeal: ultimoDeal ? new Date(ultimoDeal) : ultimoDeal === null ? null : undefined,
        referralId: referralId !== undefined ? (referralId || null) : undefined,
        attivo: attivo !== undefined ? attivo : undefined,
      },
      include: {
        referral: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            referredBy: true,
          },
        },
      },
    });
    
    // Converti Decimal a number e DateTime a string per il frontend
    const formattedCustomer = {
      id: customer.id,
      name: customer.name,
      spesa: parseFloat(customer.spesa.toString()),
      debito: parseFloat(customer.debito.toString()),
      ultimoDeal: customer.ultimoDeal ? customer.ultimoDeal.toISOString() : null,
      referralId: customer.referralId,
      referral: customer.referral,
      referredByCount: customer._count.referredBy,
      attivo: customer.attivo,
      isReferral: customer.isReferral,
      referralColor: customer.referralColor,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
    
    res.json(formattedCustomer);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del cliente' });
  }
});

// PUT /api/customers/:id/referral - Aggiorna impostazioni referral
router.put('/:id/referral', async (req, res) => {
  try {
    const { isReferral, referralColor } = req.body;
    
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        isReferral: isReferral !== undefined ? isReferral : undefined,
        referralColor: referralColor !== undefined ? referralColor : undefined,
      },
      include: {
        referral: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            referredBy: true,
          },
        },
      },
    });
    
    // Converti Decimal a number e DateTime a string per il frontend
    const formattedCustomer = {
      id: customer.id,
      name: customer.name,
      spesa: parseFloat(customer.spesa.toString()),
      debito: parseFloat(customer.debito.toString()),
      ultimoDeal: customer.ultimoDeal ? customer.ultimoDeal.toISOString() : null,
      referralId: customer.referralId,
      referral: customer.referral,
      referredByCount: customer._count.referredBy,
      attivo: customer.attivo,
      isReferral: customer.isReferral,
      referralColor: customer.referralColor,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
    
    res.json(formattedCustomer);
  } catch (error: any) {
    console.error('Error updating referral:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del referral' });
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

