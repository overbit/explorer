import {
    DecodedInstructionCard,
    type FieldValue,
    type InstructionArg,
    type InstructionEvent,
    type RawInstructionNode,
    useInstructionSurface,
} from '@entities/instruction-card';
import { extractEventsFromLogs } from '@entities/program-logs';
import { useTransactionDetails } from '@providers/transactions';
import { PublicKey } from '@solana/web3.js';
import React from 'react';

import { fromBase64 } from '@/app/shared/lib/bytes';
import { toKitAddress } from '@/app/shared/lib/web3js-compat';
import {
    decodeManifestEvent,
    decodeManifestInstruction,
    decodeManifestWrapperInstruction,
    isManifestProgramId,
    type ManifestDecodedField,
    type ManifestDecodedInstruction,
} from '@/app/utils/manifest';

/**
 * The upstream instruction renderer now uses InstructionNodeCard instead of the
 * removed legacy InstructionCard. Keep the fork's Manifest decoder and render
 * its account labels, arguments and log events through the new shared card.
 */
export function ManifestDetailsCard({ node, fallback }: { node: RawInstructionNode; fallback: React.ReactNode }) {
    const { signature } = useInstructionSurface();
    const { raw } = node;
    const isManifest = isManifestProgramId(raw.programId);
    const decoded = React.useMemo(
        () =>
            isManifest
                ? decodeManifestInstruction(raw.data)
                : decodeManifestWrapperInstruction(raw.data, raw.programId),
        [isManifest, raw.data, raw.programId],
    );

    if (!decoded) return <>{fallback}</>;

    return signature && isManifest ? (
        <ManifestLoggedCard node={node} decoded={decoded} signature={signature} />
    ) : (
        <ManifestCard node={node} decoded={decoded} />
    );
}

function ManifestLoggedCard({
    node,
    decoded,
    signature,
}: {
    node: RawInstructionNode;
    decoded: ManifestDecodedInstruction;
    signature: string;
}) {
    const details = useTransactionDetails(signature);
    const events = React.useMemo((): InstructionEvent[] => {
        const transactionWithMeta = details?.data?.transactionWithMeta;
        const logMessages = transactionWithMeta?.meta?.logMessages;
        if (!logMessages || !transactionWithMeta) return [];

        const programIds = transactionWithMeta.transaction.message.instructions.map(ix =>
            ix.programId.toBase58(),
        );
        return extractEventsFromLogs(logMessages, node.index, programIds).map((payload): InstructionEvent => {
            const data = fromBase64(payload.data);
            const event = decodeManifestEvent(payload.data);
            return event
                ? { kind: 'decoded', name: event.title, args: event.fields.map(manifestArg), data }
                : { kind: 'unknown', data };
        });
    }, [details, node.index]);

    return <ManifestCard node={node} decoded={decoded} events={events} />;
}

function ManifestCard({
    node,
    decoded,
    events,
}: {
    node: RawInstructionNode;
    decoded: ManifestDecodedInstruction;
    events?: readonly InstructionEvent[];
}) {
    return (
        <DecodedInstructionCard
            node={node}
            title={decoded.title}
            programName="Manifest"
            accountNames={decoded.accounts.map(account => account.label)}
            args={[
                {
                    kind: 'leaf',
                    name: 'Instruction Discriminator',
                    type: 'u8',
                    value: { kind: 'text', value: String(decoded.instructionDiscriminator) },
                },
                ...decoded.args.map(manifestArg),
            ]}
            events={events}
        />
    );
}

function manifestArg(field: ManifestDecodedField): InstructionArg {
    let value: FieldValue;
    if (field.type === 'publicKey' && typeof field.value === 'string') {
        value = { kind: 'address', address: toKitAddress(new PublicKey(field.value)) };
    } else if (typeof field.value === 'string') {
        value = { kind: 'string', value: field.value };
    } else {
        value = {
            kind: 'text',
            value: Array.isArray(field.value) ? field.value.join(', ') : String(field.value),
        };
    }

    return { kind: 'leaf', name: field.label, type: field.type, value };
}
