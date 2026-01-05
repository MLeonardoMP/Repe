import { listHistoryAction } from '@/app/actions/history';
import { HistoryClient } from '@/components/history/history-client';

const ITEMS_PER_PAGE = 10;

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const initial = await listHistoryAction({ limit: ITEMS_PER_PAGE });

  const initialEntries = initial.data.map((entry) => ({
    ...entry,
    performedAt: entry.performedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
  }));

  return (
    <HistoryClient
      initialEntries={initialEntries}
      initialCursor={initial.cursor}
      initialHasMore={initial.hasMore}
      pageSize={ITEMS_PER_PAGE}
    />
  );
}