# Sistema di Gestione Magazzino e Casse

Web application completa per la gestione di:
- **2 Magazzini** - Gestione di più magazzini
- **Prodotti** - Catalogo prodotti con prezzi e SKU
- **Clienti** - Anagrafica clienti
- **2 Casse** - Gestione di più casse con saldi
- **Movimentazioni Merce** - Tracciamento entrate/uscite merce per magazzino
- **Movimentazioni Denaro** - Tracciamento entrate/uscite denaro per cassa

Stack tecnologico: React + Vite + TypeScript (frontend), Node.js + Express + TypeScript (backend), PostgreSQL su Neon con Prisma ORM.

## 🚀 Setup Iniziale

### Prerequisiti
- Node.js 18+ e npm
- Account Neon per il database PostgreSQL

### Installazione

1. **Installa le dipendenze:**
```bash
npm run install:all
```

2. **Configura il database:**
   - Crea un file `.env` nella cartella `backend/` con il seguente contenuto:
   ```
   DATABASE_URL="postgresql://neondb_owner:npg_Pog2wrWNLU8p@ep-late-mountain-ag319xku-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   PORT=3001
   NODE_ENV=development
   ```

3. **Inizializza il database:**
```bash
cd backend
npm run db:generate
npm run db:push
```

4. **Avvia l'applicazione:**
```bash
# Dalla root del progetto
npm run dev
```

Questo avvierà:
- Frontend su http://localhost:3000
- Backend su http://localhost:3001

## 📁 Struttura del Progetto

```
.
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/              # Pagine dell'applicazione
│   │   │   ├── Home.tsx        # Dashboard
│   │   │   ├── Warehouses.tsx  # Gestione magazzini
│   │   │   ├── Products.tsx    # Gestione prodotti
│   │   │   ├── Customers.tsx   # Gestione clienti
│   │   │   ├── CashRegisters.tsx    # Gestione casse
│   │   │   ├── StockMovements.tsx   # Movimentazioni merce
│   │   │   └── CashMovements.tsx    # Movimentazioni denaro
│   │   ├── services/
│   │   │   └── api.ts          # Client API
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/             # API routes
│   │   │   ├── warehouses.ts
│   │   │   ├── products.ts
│   │   │   ├── customers.ts
│   │   │   ├── cashRegisters.ts
│   │   │   ├── stockMovements.ts
│   │   │   └── cashMovements.ts
│   │   ├── server.ts           # Server Express
│   │   └── prisma.ts           # Prisma client
│   ├── prisma/
│   │   └── schema.prisma       # Schema database
│   └── package.json
└── package.json                 # Root package.json con workspaces
```

## 🛠️ Script Disponibili

### Root
- `npm run dev` - Avvia frontend e backend in modalità sviluppo
- `npm run build` - Builda frontend e backend per produzione
- `npm run install:all` - Installa tutte le dipendenze

### Backend
- `npm run dev` - Avvia il server in modalità sviluppo
- `npm run build` - Compila TypeScript
- `npm run db:generate` - Genera Prisma Client
- `npm run db:push` - Sincronizza lo schema con il database
- `npm run db:migrate` - Crea una nuova migration
- `npm run db:studio` - Apre Prisma Studio

### Frontend
- `npm run dev` - Avvia Vite dev server
- `npm run build` - Builda per produzione
- `npm run preview` - Preview della build di produzione

## 🎯 Funzionalità

### Magazzini
- Creazione e gestione di più magazzini
- Visualizzazione livelli di scorta per magazzino

### Prodotti
- Catalogo prodotti con nome, descrizione, SKU e prezzo
- Tracciamento quantità per magazzino

### Clienti
- Anagrafica clienti completa (nome, email, telefono, indirizzo)

### Casse
- Gestione di più casse
- Saldo iniziale e saldo corrente
- Aggiornamento automatico del saldo con le movimentazioni

### Movimentazioni Merce
- Registrazione entrate/uscite merce
- Aggiornamento automatico dei livelli di scorta
- Validazione quantità (impedisce uscite superiori alla disponibilità)
- Filtri per prodotto e magazzino

### Movimentazioni Denaro
- Registrazione entrate/uscite denaro
- Aggiornamento automatico del saldo cassa
- Validazione saldo (impedisce uscite superiori al saldo disponibile)
- Filtri per cassa

## 📝 Note

- Il database è configurato per PostgreSQL su Neon
- Prisma ORM è utilizzato per la gestione del database
- Il frontend è configurato con proxy per le chiamate API
- TypeScript è abilitato sia per frontend che backend
- Le movimentazioni aggiornano automaticamente i livelli di scorta e i saldi delle casse
- Validazioni lato server per prevenire quantità/saldi negativi

## 🔧 Personalizzazione

Modifica `backend/prisma/schema.prisma` per aggiungere o modificare i modelli di dati.

