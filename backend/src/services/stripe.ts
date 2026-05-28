import Stripe from 'stripe';
import { prisma } from '../index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const PRICE_IDS: Record<string, string> = {
  PRO: process.env.STRIPE_PRO_PRICE_ID!,
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID!,
  LIFETIME: process.env.STRIPE_LIFETIME_PRICE_ID!,
};

export async function createCheckoutSession(userId: string, plan: string) {
  const priceId = PRICE_IDS[plan];
  if (!priceId) throw new Error('无效的订阅计划');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('用户不存在');

  let customerId: string;

  const existingSub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (existingSub) {
    customerId = existingSub.stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId },
    });
    customerId = customer.id;
  }

  const isLifetime = plan === 'LIFETIME';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: isLifetime ? 'payment' : 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing`,
    metadata: { userId, plan },
  });

  return { url: session.url };
}

export async function createPortalSession(userId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!sub) throw new Error('未找到订阅信息');

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`,
  });

  return { url: session.url };
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (!userId || !plan) break;

      if (plan === 'LIFETIME') {
        // One-time payment: no subscription to retrieve
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubId: `lifetime_${session.id}`,
            plan,
            status: 'active',
            currentPeriodEnd: new Date('2099-12-31'),
          },
          update: {
            stripeSubId: `lifetime_${session.id}`,
            plan,
            status: 'active',
            currentPeriodEnd: new Date('2099-12-31'),
          },
        });
      } else {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubId: subscription.id,
            plan,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          update: {
            stripeSubId: subscription.id,
            plan,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { plan },
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubId: subscription.id },
      });

      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubId: subscription.id },
      });

      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'canceled' },
        });

        await prisma.user.update({
          where: { id: sub.userId },
          data: { plan: 'FREE' },
        });
      }
      break;
    }
  }
}

export async function getPlans() {
  return [
    {
      id: 'FREE',
      name: '免费版',
      price: 0,
      currency: 'CNY',
      interval: '',
      features: ['每日登录赠送 1 次 AI 解构', '梦境记录与时间线', '基础数据洞察'],
    },
    {
      id: 'PRO',
      name: '探索版',
      price: 29,
      currency: 'CNY',
      interval: 'month',
      priceId: PRICE_IDS.PRO,
      features: ['无限 AI 解构', '全部心理学学派', '梦境画廊生成', '深度数据洞察'],
    },
    {
      id: 'PREMIUM',
      name: '深度版',
      price: 79,
      currency: 'CNY',
      interval: 'month',
      priceId: PRICE_IDS.PREMIUM,
      features: ['探索版全部功能', '高级梦境分析模型', '个人梦境报告', '优先客服支持'],
    },
    {
      id: 'LIFETIME',
      name: '终身版',
      price: 499,
      currency: 'CNY',
      interval: 'one-time',
      priceId: PRICE_IDS.LIFETIME,
      features: ['深度版全部功能', '终身免费更新', '专属徽章'],
    },
  ];
}
