export type MovementType = 'IN' | 'OUT';

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  stockLevels?: StockLevel[];
}

export interface StockLevel {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  product?: Product;
  warehouse?: Warehouse;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashRegister {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
  cashMovements?: CashMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  date: string;
  product?: Product;
  warehouse?: Warehouse;
  createdAt: string;
}

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  type: MovementType;
  amount: number;
  description?: string;
  date: string;
  cashRegister?: CashRegister;
  createdAt: string;
}

