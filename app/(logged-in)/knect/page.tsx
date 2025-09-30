import { requireAuth } from '@/lib/auth/utils';
import KnectClient from './knect-client';

export default async function Page() {
  await requireAuth();
  return <KnectClient />;
}


