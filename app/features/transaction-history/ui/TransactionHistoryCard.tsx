'use client';

import { getTransactionRows, HistoryCardFooter, HistoryCardHeader } from '@components/account/HistoryCardComponents';
import { Copyable } from '@components/common/Copyable';
import { ErrorCard } from '@components/common/ErrorCard';
import { LoadingCard } from '@components/common/LoadingCard';
import { Signature } from '@components/common/Signature';
import { Slot } from '@components/common/Slot';
import { useAccountHistory, useFetchAccountHistory } from '@providers/accounts/history';
import { FetchStatus } from '@providers/cache';
import { PublicKey } from '@solana/web3.js';
import { displayTimestampUtc } from '@utils/date';
import React, { useCallback, useMemo } from 'react';

import { useFetchRawTransaction, useRawTransactionDetails } from '@/app/providers/transactions/raw';
import { DownloadDropdown } from '@/app/shared/components/DownloadDropdown';
import { toBase64 } from '@/app/shared/lib/bytes';
import { RelativeTime } from '@/app/shared/RelativeTime';

import { useInstructionNames } from '../lib/use-instruction-names';
import { InstructionList, InstructionListSkeleton } from './InstructionList';

export function TransactionHistoryCard({ address }: { address: string }) {
    const pubkey = useMemo(() => new PublicKey(address), [address]);
    const history = useAccountHistory(address);
    const fetchAccountHistory = useFetchAccountHistory();
    const refresh = () => fetchAccountHistory(pubkey, false, true);
    const loadMore = () => fetchAccountHistory(pubkey, false);

    const transactionRows = React.useMemo(() => {
        if (history?.data?.fetched) {
            return getTransactionRows(history.data.fetched);
        }
        return [];
    }, [history]);

    React.useEffect(() => {
        if (!history) {
            refresh();
        }
    }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!history) {
        return null;
    }

    if (history?.data === undefined) {
        if (history.status === FetchStatus.Fetching) {
            return <LoadingCard message="Loading history" />;
        }

        return <ErrorCard retry={refresh} text="Failed to fetch transaction history" />;
    }

    const hasTimestamps = transactionRows.some(element => element.blockTime);
    const detailsList: React.ReactNode[] = transactionRows.map(
        ({ slot, signature, blockTime, statusClass, statusText, signatureInfo }) => (
            <TransactionRow
                key={signature}
                signature={signature}
                slot={slot}
                blockTime={blockTime}
                statusClass={statusClass}
                statusText={statusText}
                memo={signatureInfo.memo}
                hasTimestamps={hasTimestamps}
            />
        ),
    );

    const fetching = history.status === FetchStatus.Fetching;
    return (
        <div className="card">
            <HistoryCardHeader
                fetching={fetching}
                refresh={() => refresh()}
                title="Transaction History"
                analyticsSection="transaction_history_header"
            />
            <div className="table-responsive mb-0">
                <table className="table table-sm table-nowrap card-table">
                    <thead>
                        <tr>
                            <th className="text-muted w-1">Transaction Signature</th>
                            <th className="text-muted w-1">Block</th>
                            {hasTimestamps && (
                                <>
                                    <th className="text-muted w-1">Age</th>
                                    <th className="text-muted w-1">Timestamp</th>
                                </>
                            )}
                            <th className="text-muted">Memo</th>
                            <th className="text-muted">Result</th>
                            <th className="text-muted">Raw Data</th>
                        </tr>
                    </thead>
                    <tbody className="list">{detailsList}</tbody>
                </table>
            </div>
            <HistoryCardFooter fetching={fetching} foundOldest={history.data.foundOldest} loadMore={() => loadMore()} />
        </div>
    );
}

type TransactionRowProps = {
    signature: string;
    slot: number;
    blockTime: number | null | undefined;
    statusClass: string;
    statusText: string;
    memo?: string | null;
    hasTimestamps: boolean;
};

function TransactionRow({
    signature,
    slot,
    blockTime,
    statusClass,
    statusText,
    memo,
    hasTimestamps,
}: TransactionRowProps) {
    const instructionNames = useInstructionNames(signature);

    return (
        <tr>
            <td>
                <Signature signature={signature} link truncateChars={40} />
                {instructionNames !== null && instructionNames.length > 0 ? (
                    <InstructionList instructions={instructionNames} />
                ) : instructionNames === null ? (
                    <InstructionListSkeleton />
                ) : null}
            </td>

            <td className="w-1">
                <Slot slot={slot} link />
            </td>

            {hasTimestamps && (
                <>
                    <td className="text-muted">{blockTime ? <RelativeTime date={blockTime * 1000} /> : '---'}</td>
                    <td className="text-muted">{blockTime ? displayTimestampUtc(blockTime * 1000, true) : '---'}</td>
                </>
            )}

            <td>{memo ? <MemoField memo={memo} /> : '---'}</td>

            <td>
                <span className={`badge bg-${statusClass}-soft`}>{statusText}</span>
            </td>
            <td>
                <TransactionRawDataDownloadField signature={signature} />
            </td>
        </tr>
    );
}

function TransactionRawDataDownloadField({ signature }: { signature: string }) {
    const fetchRaw = useFetchRawTransaction();
    const rawDetails = useRawTransactionDetails(signature);
    const serialized = rawDetails?.data?.raw?.message.serialize();
    const transactionData = useMemo(() => serialized && new Uint8Array(serialized), [serialized]);
    const loading = rawDetails?.status === FetchStatus.Fetching;

    const handleHover = useCallback(() => {
        if (!transactionData) {
            fetchRaw(signature);
        }
    }, [transactionData, signature, fetchRaw]);

    return (
        <div className="d-flex align-items-center gap-1" onMouseEnter={handleHover}>
            <Copyable text={transactionData ? toBase64(transactionData) : null}>
                <DownloadDropdown data={transactionData} loading={loading} filename={signature} />
            </Copyable>
        </div>
    );
}

function MemoField({ memo }: { memo: string }) {
    const [showTooltip, setShowTooltip] = React.useState(false);
    const truncateLength = 25;
    // Remove memo length like "[15] " from the memo for display (handles all occurrences)
    // eslint-disable-next-line no-restricted-syntax -- Regex is needed to strip repeated "[<len>]" memo prefixes from RPC memo strings.
    const cleanMemo = memo.replace(/\[\d+\]\s*/g, '').trim();
    const isTruncated = cleanMemo.length > truncateLength;
    const displayText = isTruncated ? `${cleanMemo.slice(0, truncateLength)}...` : cleanMemo;

    return (
        <div
            className="popover-container"
            onMouseOver={() => isTruncated && setShowTooltip(true)}
            onMouseOut={() => setShowTooltip(false)}
            style={{ cursor: isTruncated ? 'pointer' : 'default' }}
        >
            <Copyable text={cleanMemo}>
                <span className="text">{displayText}</span>
            </Copyable>
            {showTooltip && (
                <div className="popover bs-popover-top show" style={{ maxWidth: '20rem' }}>
                    <div className="arrow" />
                    <div className="popover-body" style={{ wordBreak: 'break-word' }}>
                        {cleanMemo}
                    </div>
                </div>
            )}
        </div>
    );
}
