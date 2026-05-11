import { createTRPCReact } from '@trpc/react-query';

// Usar cualquier tipo temporalmente - el router será validado en tiempo de ejecución
export const trpc = createTRPCReact<any>();