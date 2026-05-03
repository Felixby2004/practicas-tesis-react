import * as jwt from 'jsonwebtoken';

export async function verifyJwt(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (error) {
    return null;
  }
}