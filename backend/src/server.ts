import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import warehousesRouter from './routes/warehouses.js';
import productsRouter from './routes/products.js';
import customersRouter from './routes/customers.js';
import cashRegistersRouter from './routes/cashRegisters.js';
import stockMovementsRouter from './routes/stockMovements.js';
import cashMovementsRouter from './routes/cashMovements.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api/warehouses', warehousesRouter);
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/cash-registers', cashRegistersRouter);
app.use('/api/stock-movements', stockMovementsRouter);
app.use('/api/cash-movements', cashMovementsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

