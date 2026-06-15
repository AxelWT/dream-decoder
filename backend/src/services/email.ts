/**
 * 邮件发送服务模块
 *
 * 基于 Nodemailer 封装的邮件发送功能，使用 SMTP 协议发送邮件。
 * 默认使用 QQ 邮箱 SMTP 服务（smtp.qq.com:465），可通过环境变量自定义。
 *
 * 环境变量配置：
 * - SMTP_HOST: SMTP 服务器地址（默认 smtp.qq.com）
 * - SMTP_PORT: SMTP 端口（默认 465，SSL 加密）
 * - SMTP_USER: SMTP 登录账号
 * - SMTP_PASS: SMTP 授权码（非邮箱登录密码）
 * - SMTP_FROM: 发件人地址（默认同 SMTP_USER）
 */
import nodemailer from 'nodemailer';

/**
 * 邮件发送选项接口
 */
interface EmailOptions {
  /** 收件人邮箱地址 */
  to: string;
  /** 邮件主题 */
  subject: string;
  /** 邮件正文 HTML 内容 */
  html: string;
}

/**
 * Nodemailer 传输器实例
 * 配置 SMTP 连接参数，启用 SSL 安全连接（secure: true）
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',  // SMTP 服务器，默认 QQ 邮箱
  port: Number(process.env.SMTP_PORT) || 465,     // 端口，465 为 SSL 加密端口
  secure: true,                                    // 启用 SSL/TLS
  auth: {
    user: process.env.SMTP_USER, // SMTP 登录账号
    pass: process.env.SMTP_PASS, // SMTP 授权码
  },
});

/**
 * 发送邮件
 *
 * @param options - 邮件发送选项
 * @param options.to - 收件人邮箱
 * @param options.subject - 邮件主题
 * @param options.html - 邮件 HTML 正文
 * @returns Nodemailer 发送结果
 */
export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER, // 发件人，默认同 SMTP 账号
      to,       // 收件人
      subject,  // 邮件主题
      html,     // HTML 正文
    });
    console.log(`📧 邮件发送成功: to=${to}, messageId=${info.messageId}, response=${info.response}`);
  } catch (err: any) {
    console.error(`❌ 邮件发送失败: to=${to}, error=${err.code || err.message}`, err);
  }
}
