import { listHistoryAction } from '@/app/actions/history';
import { HistoryClient } from '@/components/history/history-client';

const ITEMS_PER_PAGE = 10;

export default async function HistoryPage() {
  const initial = await listHistoryAction({ limit: ITEMS_PER_PAGE });

  return (
    <HistoryClient
      initialEntries={initial.data}
      initialCursor={initial.cursor}
      initialHasMore={initial.hasMore}
      pageSize={ITEMS_PER_PAGE}
    />
  );
}