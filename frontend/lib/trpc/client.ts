import { createTRPCReact } from '@trpc/react-query';
// import type { AppRouter } from '../../../backend/src/trpc/trpc.router';

// Para producción, usa un tipo any para evitar dependencias del backend
export const trpc = createTRPCReact<any>();