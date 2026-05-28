import crypto from 'crypto';
import { prisma } from '../index.js';

const PAYJS_KEY = process.env.PAYJS_KEY!;
const PAYJS_MCHID = process.env.PAYJS_MCHID!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 计划价格映射（单位：分）
const PLAN_PRICES: Record<string, number> = {
  PRO: 2900,
  PREMIUM: 7900,
  LIFETIME: 49900,
};

// 计划名称映射
const PLAN_NAMES: Record<string, string> = {
  PRO: 'Dream Decoder 探索版',
  PREMIUM: 'Dream Decoder 深度版',
  LIFETIME: 'Dream Decoder 终身版',
};

/**
 * 生成 PayJS 签名
 */
function generateSign(params: Record<string, any>): string {
  // 按 key 排序，过滤空值和 sign
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== 'sign' && params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort();

  const stringA = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  const stringSignTemp = `${stringA}&key=${PAYJS_KEY}`;
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
}

/**
 * 创建 PayJS Native 支付订单
 */
export async function createOrder(userId: string, plan: string) {
  const price = PLAN_PRICES[plan];
  if (!price) throw new Error('无效的订阅计划');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('用户不存在');

  // 生成唯一订单号
  const orderId = `DD${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

  // 创建本地订单记录
  await prisma.order.create({
    data: {
      userId,
      plan,
      amount: price,
      orderId,
      status: 'pending',
    },
  });

  // PayJS Native 支付参数
  const params: Record<string, any> = {
    mchid: PAYJS_MCHID,
    total_fee: price,
    out_trade_no: orderId,
    body: PLAN_NAMES[plan] || 'Dream Decoder 订阅',
    notify_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payjs/notify`,
    callback_url: `${FRONTEND_URL}/payment-success?order_id=${orderId}`,
  };

  params.sign = generateSign(params);

  // 调用 PayJS Native 支付 API
  const response = await fetch('https://payjs.cn/api/native', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('PayJS 请求失败');
  }

  const data = await response.json();

  if (data.return_code !== 1) {
    throw new Error(data.return_msg || 'PayJS 创建订单失败');
  }

  return {
    qrcode: data.qrcode,
    orderId,
  };
}

/**
 * 查询订单状态
 */
export async function getOrderStatus(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { orderId, userId },
  });

  if (!order) throw new Error('订单不存在');

  return {
    orderId: order.orderId,
    status: order.status,
    plan: order.plan,
    amount: order.amount,
    paidAt: order.paidAt,
  };
}

/**
 * 验证 PayJS 回调签名并处理支付成功
 */
export async function handleNotify(body: Record<string, any>) {
  const { sign, ...rest } = body;

  // 验证签名
  const expectedSign = generateSign(rest);
  if (sign !== expectedSign) {
    console.error('PayJS 回调签名验证失败');
    return false;
  }

  const { out_trade_no, total_fee, orderid } = rest;

  // 查找订单
  const order = await prisma.order.findUnique({
    where: { orderId: out_trade_no },
  });

  if (!order) {
    console.error('PayJS 回调: 订单不存在', out_trade_no);
    return false;
  }

  // 防止重复处理
  if (order.status === 'paid') {
    return true;
  }

  // 验证金额
  if (total_fee !== order.amount) {
    console.error('PayJS 回调: 金额不匹配', total_fee, order.amount);
    return false;
  }

  // 更新订单状态
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'paid',
      payjsOrderId: orderid,
      paidAt: new Date(),
    },
  });

  // 计算订阅到期时间
  let currentPeriodEnd: Date | null = null;
  if (order.plan === 'PRO' || order.plan === 'PREMIUM') {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    currentPeriodEnd = endDate;
  } else if (order.plan === 'LIFETIME') {
    currentPeriodEnd = new Date('2099-12-31');
  }

  // 更新或创建订阅
  await prisma.subscription.upsert({
    where: { userId: order.userId },
    create: {
      userId: order.userId,
      plan: order.plan,
      status: 'active',
      currentPeriodEnd,
    },
    update: {
      plan: order.plan,
      status: 'active',
      currentPeriodEnd,
    },
  });

  // 升级用户计划
  await prisma.user.update({
    where: { id: order.userId },
    data: { plan: order.plan },
  });

  console.log(`PayJS 支付成功: 用户 ${order.userId} 升级到 ${order.plan}`);
  return true;
}
