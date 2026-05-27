import { api } from './api';
import type { Plan } from '../types';

export async function getPlans() {
  return api.get<Plan[]>('/plans');
}

export async function createCheckout(plan: string) {
  return api.post<{ url: string }>('/stripe/create-checkout', { plan });
}

export async function createPortal() {
  return api.post<{ url: string }>('/stripe/portal');
}
