'use client';

import { Copyable } from '@components/common/Copyable';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/shared/ui/tooltip';

const MEMO_TRUNCATE_LENGTH = 25;

export function MemoCell({ memo }: { memo: string }) {
    const cleanMemo = stripMemoLengthPrefixes(memo);
    const isTruncated = cleanMemo.length > MEMO_TRUNCATE_LENGTH;
    const displayText = isTruncated ? `${cleanMemo.slice(0, MEMO_TRUNCATE_LENGTH)}...` : cleanMemo;

    return (
        <Copyable text={cleanMemo}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={isTruncated ? 'cursor-pointer' : undefined}>{displayText}</span>
                </TooltipTrigger>
                {isTruncated && (
                    <TooltipContent className="max-w-80">
                        <span className="break-all">{cleanMemo}</span>
                    </TooltipContent>
                )}
            </Tooltip>
        </Copyable>
    );
}

function stripMemoLengthPrefixes(memo: string) {
    // RPC memo strings may repeat `[<byte length>]` prefixes when multiple memo instructions are present.
    // eslint-disable-next-line no-restricted-syntax -- the prefix format is numeric and may occur more than once
    return memo.replace(/\[\d+\]\s*/g, '').trim();
}
