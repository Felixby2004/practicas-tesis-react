import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export interface TrpcContext {
  user?: {
    id: string;
    email: string;
    nombre_completo?: string;
    rol: string;
  };
}

export async function createTrpcContext({ req }: { req: Request }): Promise<TrpcContext> {
  let user = undefined;
  
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      user = {
        id: decoded.sub,
        email: decoded.correo,
        nombre_completo: decoded.nombre_completo,
        rol: decoded.rol,
      };
    }
  } catch (error) {
    // Token inválido o expirado
  }
  
  return { user };
}