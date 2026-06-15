/**
 * PayJS 微信支付服务模块
 *
 * 负责微信支付相关的所有业务逻辑，包括：
 * - 创建 Native 支付订单（生成二维码链接）
 * - 查询订单状态
 * - 处理 PayJS 支付回调通知（验签、更新订单、开通订阅、升级用户计划）
 *
 * 支持的订阅计划及定价（单位：分）：
 * - PRO（探索版）: ¥29.00
 * - PREMIUM（深度版）: ¥79.00
 * - LIFETIME（终身版）: ¥499.00
 *
 * 环境变量配置：
 * - PAYJS_KEY: PayJS 通信密钥（用于签名计算与验证）
 * - PAYJS_MCHID: PayJS 商户号
 * - FRONTEND_URL: 前端地址（用于支付成功回调跳转）
 * - BACKEND_URL: 后端地址（用于 PayJS 通知回调地址）
 */
import crypto from 'crypto';
import { prisma } from '../index.js';

/** PayJS 通信密钥，用于 MD5 签名计算和验签 */
const PAYJS_KEY = process.env.PAYJS_KEY!;
/** PayJS 商户号 */
const PAYJS_MCHID = process.env.PAYJS_MCHID!;
/** 前端地址，用于支付完成后页面跳转 */
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * 计划价格映射（单位：分）
 * 1 元 = 100 分
 */
const PLAN_PRICES: Record<string, number> = {
  PRO: 2900,       // ¥29.00
  PREMIUM: 7900,   // ¥79.00
  LIFETIME: 49900, // ¥499.00
};

/** 计划名称映射（用于订单标题和支付页面展示） */
const PLAN_NAMES: Record<string, string> = {
  PRO: 'Dream Decoder 探索版',
  PREMIUM: 'Dream Decoder 深度版',
  LIFETIME: 'Dream Decoder 终身版',
};

/**
 * 生成 PayJS 签名
 *
 * 签名算法（MD5）：
 * 1. 过滤空值和 sign 字段
 * 2. 按 key 的 ASCII 码升序排列
 * 3. 拼接为 key=value&key=value 格式（stringA）
 * 4. 末尾拼接 &key=PAYJS_KEY（stringSignTemp）
 * 5. 对 stringSignTemp 做 MD5 哈希，结果转大写
 *
 * @param params - 参与签名的参数对象
 * @returns 大写 MD5 签名字符串
 */
function generateSign(params: Record<string, any>): string {
  // 按 key 排序，过滤空值和 sign 字段
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== 'sign' && params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort();

  // 拼接 key=value 对
  const stringA = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  // 拼接密钥
  const stringSignTemp = `${stringA}&key=${PAYJS_KEY}`;
  // MD5 哈希并转大写
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
}

/**
 * 创建 PayJS Native 支付订单
 *
 * 核心流程：
 * 1. 校验计划类型和用户存在性
 * 2. 生成唯一订单号（DD + 时间戳 + 随机字符串）
 * 3. 在数据库创建 pending 状态的订单记录
 * 4. 组装 PayJS 支付参数并生成签名
 * 5. 调用 PayJS Native API 获取二维码链接
 *
 * @param userId - 用户 ID
 * @param plan - 订阅计划标识（PRO / PREMIUM / LIFETIME）
 * @returns { qrcode: string, orderId: string } 二维码链接和订单号
 * @throws 无效的订阅计划 / 用户不存在 / PayJS 请求失败
 */
export async function createOrder(userId: string, plan: string) {
  // 校验计划类型，获取对应价格
  const price = PLAN_PRICES[plan];
  if (!price) throw new Error('无效的订阅计划');

  // 校验用户存在性
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('用户不存在');

  // 生成唯一订单号：DD前缀 + 当前时间戳 + 6位随机字符
  const orderId = `DD${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

  // 在数据库创建订单记录（初始状态为 pending）
  await prisma.order.create({
    data: {
      userId,
      plan,
      amount: price,
      orderId,
      status: 'pending',
    },
  });

  // 组装 PayJS Native 支付参数
  const params: Record<string, any> = {
    mchid: PAYJS_MCHID,                          // 商户号
    total_fee: price,                              // 金额（分）
    out_trade_no: orderId,                         // 商户订单号
    body: PLAN_NAMES[plan] || 'Dream Decoder 订阅', // 订单标题
    notify_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payjs/notify`, // 异步通知地址
    callback_url: `${FRONTEND_URL}/payment-success?order_id=${orderId}`,                  // 前端跳转地址
  };

  // 生成签名并附加到参数中
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

  // return_code !== 1 表示 PayJS 侧创建订单失败
  if (data.return_code !== 1) {
    throw new Error(data.return_msg || 'PayJS 创建订单失败');
  }

  return {
    qrcode: data.qrcode,  // 微信支付二维码链接，前端用于生成二维码
    orderId,               // 商户订单号，前端用于轮询支付状态
  };
}

/**
 * 查询订单状态
 *
 * @param orderId - 商户订单号
 * @param userId - 用户 ID（确保只能查询自己的订单）
 * @returns 订单状态信息
 * @throws 订单不存在
 */
export async function getOrderStatus(orderId: string, userId: string) {
  // 根据 orderId 和 userId 查询，防止越权查询他人订单
  const order = await prisma.order.findFirst({
    where: { orderId, userId },
  });

  if (!order) throw new Error('订单不存在');

  return {
    orderId: order.orderId,
    status: order.status,     // pending / paid
    plan: order.plan,         // 订阅计划
    amount: order.amount,     // 支付金额（分）
    paidAt: order.paidAt,     // 支付完成时间
  };
}

/**
 * 处理 PayJS 支付回调通知
 *
 * 核心流程：
 * 1. 验证回调签名（防止伪造通知）
 * 2. 查找本地订单记录
 * 3. 防止重复处理（订单已 paid 则直接返回）
 * 4. 验证支付金额是否匹配
 * 5. 更新订单状态为 paid
 * 6. 计算订阅到期时间
 * 7. 创建或更新订阅记录（upsert）
 * 8. 升级用户计划
 *
 * @param body - PayJS 回调请求体（包含签名和支付信息）
 * @returns 验证和处理是否成功（true = 成功，false = 签名错误/订单不存在/金额不匹配）
 */
export async function handleNotify(body: Record<string, any>) {
  const { sign, ...rest } = body;

  // 第一步：验证签名，防止伪造的回调通知
  const expectedSign = generateSign(rest);
  if (sign !== expectedSign) {
    console.error('PayJS 回调签名验证失败');
    return false;
  }

  const { out_trade_no, total_fee, orderid } = rest;
  // out_trade_no: 商户订单号
  // total_fee: 实际支付金额（分）
  // orderid: PayJS 平台订单号

  // 第二步：查找本地订单
  const order = await prisma.order.findUnique({
    where: { orderId: out_trade_no },
  });

  if (!order) {
    console.error('PayJS 回调: 订单不存在', out_trade_no);
    return false;
  }

  // 第三步：防止重复处理（幂等性保障）
  if (order.status === 'paid') {
    return true;
  }

  // 第四步：验证支付金额是否与订单金额一致
  if (total_fee !== order.amount) {
    console.error('PayJS 回调: 金额不匹配', total_fee, order.amount);
    return false;
  }

  // 第五步：更新订单状态为已支付
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'paid',
      payjsOrderId: orderid,   // 保存 PayJS 平台订单号
      paidAt: new Date(),       // 记录支付完成时间
    },
  });

  // 第六步：计算订阅到期时间
  let currentPeriodEnd: Date | null = null;
  if (order.plan === 'PRO' || order.plan === 'PREMIUM') {
    // PRO 和 PREMIUM 为月付计划，到期时间为当前时间 + 1 个月
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    currentPeriodEnd = endDate;
  } else if (order.plan === 'LIFETIME') {
    // LIFETIME 为终身计划，设置远期到期时间
    currentPeriodEnd = new Date('2099-12-31');
  }

  // 第七步：创建或更新订阅记录（upsert 确保每个用户只有一条订阅）
  await prisma.subscription.upsert({
    where: { userId: order.userId },
    create: {
      userId: order.userId,
      plan: order.plan,
      status: 'active',
      currentPeriodEnd,
    },
    update: {
      plan: order.plan,            // 升级计划
      status: 'active',            // 激活订阅
      currentPeriodEnd,            // 更新到期时间
    },
  });

  // 第八步：升级用户计划
  await prisma.user.update({
    where: { id: order.userId },
    data: { plan: order.plan },
  });

  console.log(`PayJS 支付成功: 用户 ${order.userId} 升级到 ${order.plan}`);
  return true;
}
