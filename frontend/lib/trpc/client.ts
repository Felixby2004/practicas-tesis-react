import { createTRPCReact } from '@trpc/react-query';

// Declaración de tipo para evitar errores
type AnyRouter = {
  [key: string]: any;
};

export const trpc = createTRPCReact<any>();