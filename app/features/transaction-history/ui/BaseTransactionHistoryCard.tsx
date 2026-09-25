'use client';

import { RefreshButton } from '@components/shared/ui/refresh-button';
import { type ReactNode } from 'react';

import { cn } from '@/app/components/shared/utils';
import { DataListCard } from '@/app/shared/ui/DataListCard';
import { HistoryCardFooterContent } from '@/app/shared/ui/HistoryCard';
import { ROW_PADDING } from '@/app/shared/ui/spacing';

export const STATUS_BADGE = {
    failed: { label: 'Failed', variant: 'warning' },
    success: { label: 'Success', variant: 'success' },
} as const;

export type TransactionStatus = keyof typeof STATUS_BADGE;

export type TransactionHistoryRowView = {
    signature: string;
    slot: number;
    blockTime: number | null | undefined;
    status: TransactionStatus;
    memo?: string | null;
};

export type BaseTransactionHistoryCardProps = {
    rows: TransactionHistoryRowView[];
    fetching: boolean;
    foundOldest: boolean;
    onRefresh: () => void;
    onLoadMore: () => void;
    headerActions?: ReactNode;
    headerSubRow?: ReactNode;
    renderRow: (row: TransactionHistoryRowView, hasTimestamps: boolean) => ReactNode;
};

// Desktop (lg+) column track shared by the header and every row so they stay aligned: the signature
// column takes the slack; Time (only when a row has a timestamp), Block, Memo and Size are fixed-share tracks
// mirroring the previous table's column widths. Below lg the rows render as stacked cards, so this is
// scoped to `lg:`.
export function historyGridCols(hasTimestamps: boolean): string {
    return hasTimestamps
        ? 'lg:grid-cols-[minmax(0,1fr)_minmax(190px,24%)_minmax(130px,16%)_minmax(140px,18%)_minmax(110px,14%)]'
        : 'lg:grid-cols-[minmax(0,1fr)_minmax(130px,17%)_minmax(140px,20%)_minmax(110px,15%)]';
}

export function BaseTransactionHistoryCard({
    rows,
    fetching,
    foundOldest,
    onRefresh,
    onLoadMore,
    headerActions,
    headerSubRow,
    renderRow,
}: BaseTransactionHistoryCardProps) {
    const hasTimestamps = rows.some(row => row.blockTime);
    const isEmpty = rows.length === 0;

    const header = !isEmpty ? (
        <div
            className={cn(
                'hidden items-baseline gap-4 border-0 border-b border-solid border-white/10 text-xs uppercase text-outer-space-300 lg:grid',
                ROW_PADDING,
                historyGridCols(hasTimestamps),
            )}
        >
            <div>Transaction Signature</div>
            {hasTimestamps && <div>Time</div>}
            <div>Block</div>
            <div>Memo</div>
            <div>Size (bytes)</div>
        </div>
    ) : undefined;

    const footer = (
        <div
            className={cn(
                // Mobile: no outer card frame, so no top divider and no horizontal padding.
                // Desktop: the footer sits inside the card, so add the top divider + padding.
                'border-0 border-solid border-dark-border px-0 py-3 lg:px-3',
                !isEmpty && 'lg:border-t',
                isEmpty && 'py-12',
            )}
        >
            <HistoryCardFooterContent fetching={fetching} foundOldest={foundOldest} loadMore={onLoadMore} />
        </div>
    );

    return (
        <DataListCard
            title="Transaction History"
            collapsible={false}
            actions={
                <>
                    {headerActions}
                    <RefreshButton
                        analyticsSection="transaction_history_header"
                        onClick={onRefresh}
                        fetching={fetching}
                    />
                </>
            }
            belowTitle={headerSubRow ? <div className="flex flex-wrap gap-2">{headerSubRow}</div> : undefined}
            header={header}
            footer={footer}
        >
            {rows.map(row => renderRow(row, hasTimestamps))}
        </DataListCard>
    );
}
