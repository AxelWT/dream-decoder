/**
 * JWT 工具模块
 *
 * 负责 JSON Web Token 的签名（生成）与验证（解析）。
 * 生成的 Token 有效期为 7 天，载荷中仅包含 userId 字段。
 * 密钥从环境变量 JWT_SECRET 读取，未配置时回退到默认值（仅用于开发环境）。
 */
import jwt from 'jsonwebtoken';

// 从环境变量读取 JWT 签名密钥，未配置时使用默认密钥（生产环境务必配置）
const JWT_SECRET = process.env.JWT_SECRET || 'dream-decoder-secret-key';
// Token 有效期：7 天
const JWT_EXPIRES_IN = '7d';

/** JWT 载荷接口，仅包含用户 ID */
interface JwtPayload {
  userId: string;
}

/**
 * 签发 JWT Token
 *
 * 将用户 ID 编码到 Token 载荷中，使用 HS256 算法签名，有效期 7 天。
 * @param userId - 用户唯一标识
 * @returns 签名后的 JWT 字符串
 */
export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证并解析 JWT Token
 *
 * 对 Token 进行签名验证与过期检查。验证成功返回载荷对象，失败返回 null。
 * @param token - 待验证的 JWT 字符串
 * @returns 解析成功返回 { userId }，验证失败或过期返回 null
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    // jwt.verify 会校验签名与过期时间，通过后返回解码后的载荷
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    // 签名不匹配、Token 过期或格式错误均会抛出异常，此时返回 null
    return null;
  }
}
