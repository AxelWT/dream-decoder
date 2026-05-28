import { api } from './api';
import type { Plan } from '../types';

export async function getPlans() {
  return api.get<Plan[]>('/plans');
}

export async function createOrder(plan: string) {
  return api.post<{ qrcode: string; orderId: string }>('/payjs/create-order', { plan });
}

export async function getOrderStatus(orderId: string) {
  return api.get<{
    orderId: string;
    status: string;
    plan: string;
    amount: number;
    paidAt: string | null;
  }>(`/payjs/order-status?order_id=${orderId}`);
}
