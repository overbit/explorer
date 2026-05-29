import { HexData } from '@components/common/HexData';
import { useTransactionDetails } from '@providers/transactions';
import { cn } from '@shared/utils';
import { PublicKey, SignatureResult, TransactionInstruction } from '@solana/web3.js';
import { extractEventsFromLogs } from '@utils/program-logs';
import React, { useMemo, useState } from 'react';
import { Code } from 'react-feather';

import { Address } from '@/app/components/common/Address';
import { fromBase64 } from '@/app/shared/lib/bytes';
import {
    decodeManifestEvent,
    decodeManifestInstruction,
    decodeManifestWrapperInstruction,
    isManifestProgramId,
    ManifestDecodedAccount,
    ManifestDecodedField,
} from '@/app/utils/manifest';

import { InstructionCard } from '../InstructionCard';
import { UnknownDetailsCard } from '../UnknownDetailsCard';

export function ManifestDetailsCard(props: {
    ix: TransactionInstruction;
    index: number;
    result: SignatureResult;
    signature: string;
    innerCards?: JSX.Element[];
    childIndex?: number;
}) {
    const { ix, signature, index } = props;
    const isManifestInstruction = isManifestProgramId(ix.programId);
    const decodedInstruction = useMemo(
        () =>
            isManifestInstruction
                ? decodeManifestInstruction(ix.data)
                : decodeManifestWrapperInstruction(ix.data, ix.programId),
        [isManifestInstruction, ix.data, ix.programId],
    );
    const details = useTransactionDetails(signature);

    const eventCards = useMemo(() => {
        if (!isManifestInstruction) return undefined;

        const logMessages = details?.data?.transactionWithMeta?.meta?.logMessages;
        if (!logMessages) return undefined;

        const eventDataList = extractEventsFromLogs(logMessages, index);
        if (eventDataList.length === 0) return undefined;

        return [<ManifestEventsCard key="events" eventDataList={eventDataList} instructionIndex={index} />];
    }, [details, index, isManifestInstruction]);

    if (!decodedInstruction) {
        return <UnknownDetailsCard {...props} />;
    }

    return (
        <InstructionCard title={decodedInstruction.title} {...props} eventCards={eventCards}>
            <tr>
                <td>Program</td>
                <td className="text-lg-end" colSpan={2}>
                    <Address pubkey={ix.programId} alignRight link raw overrideText="Manifest" />
                </td>
            </tr>
            <tr>
                <td>Instruction Discriminator</td>
                <td className="text-lg-end font-monospace" colSpan={2}>
                    {decodedInstruction.instructionDiscriminator}
                </td>
            </tr>
            <tr className="table-sep">
                <td>Account Name</td>
                <td className="text-lg-end" colSpan={2}>
                    Address
                </td>
            </tr>
            {ix.keys.map(({ pubkey, isSigner, isWritable }, keyIndex) => {
                const account = decodedInstruction.accounts[keyIndex];
                return (
                    <tr key={keyIndex}>
                        <td>
                            <div className="me-2 d-md-inline">{account?.label ?? `Account #${keyIndex + 1}`}</div>
                            {isWritable && <span className="badge bg-danger-soft me-1">Writable</span>}
                            {isSigner && <span className="badge bg-info-soft me-1">Signer</span>}
                        </td>
                        <td className="text-lg-end" colSpan={2}>
                            <Address pubkey={pubkey} alignRight link />
                        </td>
                    </tr>
                );
            })}
            {decodedInstruction.args.length > 0 && (
                <>
                    <tr className="table-sep">
                        <td>Argument Name</td>
                        <td>Type</td>
                        <td className="text-lg-end">Value</td>
                    </tr>
                    {decodedInstruction.args.map(arg => (
                        <ManifestFieldRow key={arg.name} field={arg} />
                    ))}
                </>
            )}
        </InstructionCard>
    );
}

function ManifestEventsCard({ eventDataList, instructionIndex }: { eventDataList: string[]; instructionIndex: number }) {
    const decodedEvents = eventDataList
        .map(rawEventData => ({ event: decodeManifestEvent(rawEventData), rawEventData }))
        .filter((entry): entry is { event: ManifestDecodedAccount; rawEventData: string } => entry.event !== undefined);

    if (decodedEvents.length === 0) return null;

    return (
        <>
            {decodedEvents.map(({ event, rawEventData }, eventIndex) => (
                <ManifestEventCard
                    key={eventIndex}
                    event={event}
                    eventIndex={eventIndex}
                    instructionIndex={instructionIndex}
                    rawEventData={rawEventData}
                />
            ))}
        </>
    );
}

function ManifestEventCard({
    event,
    eventIndex,
    instructionIndex,
    rawEventData,
}: {
    event: ManifestDecodedAccount;
    eventIndex: number;
    instructionIndex: number;
    rawEventData: string;
}) {
    const [showRaw, setShowRaw] = useState(false);

    return (
        <div className="card mb-2">
            <div className="card-header">
                <h3 className="card-header-title mb-0 d-flex align-items-center">
                    <span className="badge bg-info-soft me-2">
                        #{instructionIndex + 1}.{eventIndex + 1}
                    </span>
                    {event.title}
                </h3>
                <button
                    className={cn('btn btn-sm d-flex align-items-center', showRaw ? 'btn-black active' : 'btn-white')}
                    onClick={() => setShowRaw(r => !r)}
                >
                    <Code className="me-2" size={13} /> Raw
                </button>
            </div>
            <div className="table-responsive mb-0">
                <table className="table table-sm table-nowrap card-table">
                    <tbody className="list">
                        {showRaw ? (
                            <tr>
                                <td>
                                    Event Data <span className="text-muted">(Hex)</span>
                                </td>
                                <td className="text-lg-end">
                                    <HexData raw={fromBase64(rawEventData)} />
                                </td>
                            </tr>
                        ) : (
                            <>
                                <tr className="table-sep">
                                    <td>Field Name</td>
                                    <td>Type</td>
                                    <td className="text-lg-end">Value</td>
                                </tr>
                                {event.fields.map(field => (
                                    <ManifestFieldRow key={field.name} field={field} />
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ManifestFieldRow({ field }: { field: ManifestDecodedField }) {
    return (
        <tr>
            <td>{field.label}</td>
            <td>{field.type}</td>
            <td className="text-lg-end">{renderManifestField(field)}</td>
        </tr>
    );
}

function renderManifestField(field: ManifestDecodedField): React.ReactNode {
    if (field.type === 'publicKey' && typeof field.value === 'string') {
        return <Address pubkey={new PublicKey(field.value)} alignRight link raw />;
    }

    if (typeof field.value === 'boolean') {
        return field.value ? 'Yes' : 'No';
    }

    if (Array.isArray(field.value)) {
        return <span className="font-monospace">[{field.value.join(', ')}]</span>;
    }

    return <span className="font-monospace">{field.value}</span>;
}
