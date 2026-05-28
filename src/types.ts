export interface Customer {
  id: string;
  name: string;
  phone: string;
  carType: string;
  plateNumber: string;
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  duration: number; // in minutes
}

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  totalPrice: number;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'staff' | 'cashier';
  salary: number;
  performance: number;
}

export interface Invoice {
  id: string;
  bookingId: string;
  customerId: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card';
  createdAt: string;
}
