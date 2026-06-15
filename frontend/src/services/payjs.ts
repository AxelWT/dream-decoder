/**
 * @file payjs.ts
 * @description 支付服务模块，封装套餐查询、订单创建和订单状态查询等 API 请求。
 *              对接 PayJS 微信支付通道。
 */
import { api } from './api';
import type { Plan } from '../types';

/** 获取可用套餐列表 */
export async function getPlans() {
  return api.get<Plan[]>('/plans');
}

/** 创建支付订单，返回二维码链接和订单号 */
export async function createOrder(plan: string) {
  return api.post<{ qrcode: string; orderId: string }>('/payjs/create-order', { plan });
}

/** 查询订单支付状态 */
export async function getOrderStatus(orderId: string) {
  return api.get<{
    /** 订单号 */
    orderId: string;
    /** 订单状态 */
    status: string;
    /** 套餐标识 */
    plan: string;
    /** 金额（分） */
    amount: number;
    /** 支付时间 */
    paidAt: string | null;
  }>(`/payjs/order-status?order_id=${orderId}`);
}
