import { ErrorCard } from '@components/common/ErrorCard';
import { LoadingCard } from '@components/common/LoadingCard';
import { Account, isTokenProgramData } from '@providers/accounts';
import React from 'react';

import { ExternalLink } from '@/app/components/shared/ui/external-link';
import { getProxiedUri } from '@/app/features/metadata/utils';
import { useCluster } from '@/app/providers/cluster';
import { useCompressedNft } from '@/app/providers/compressed-nft';
import { Card, CardHeader, CardTitle } from '@/app/shared/ui/Card';
import { BaseTable } from '@/app/shared/ui/Table';

interface File {
    uri: string;
    type: string;
    cdn?: boolean;
}

export function MetaplexFilesCard({ account, onNotFound }: { account?: Account; onNotFound: () => never }) {
    const { url } = useCluster();
    const compressedNft = useCompressedNft({ address: account?.pubkey.toString() ?? '', url });

    const parsedData = account?.data?.parsed;
    const parsedMetadataUri =
        parsedData && isTokenProgramData(parsedData) && parsedData.parsed.type === 'mint' && parsedData.nftData
            ? parsedData.nftData.metadata?.uri
            : undefined;

    if (typeof parsedMetadataUri === 'string' && parsedMetadataUri.length > 0) {
        return <NormalMetaplexFilesCard metadataUri={parsedMetadataUri} />;
    }

    const compressedMetadataUri =
        compressedNft && compressedNft.compression.compressed ? compressedNft.content?.json_uri : undefined;
    if (typeof compressedMetadataUri === 'string' && compressedMetadataUri.length > 0) {
        return <NormalMetaplexFilesCard metadataUri={compressedMetadataUri} />;
    }

    return onNotFound();
}

function NormalMetaplexFilesCard({ metadataUri }: { metadataUri: string }) {
    const [files, setFiles] = React.useState<File[]>([]);
    const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');

    React.useEffect(() => {
        async function fetchMetadataFiles() {
            try {
                const response = await fetch(getProxiedUri(metadataUri));
                if (!response.ok) {
                    throw new Error('Failed to fetch metadata');
                }

                const metadata: unknown = await response.json();
                const properties = getObjectProperty(metadata, 'properties');
                const metadataFiles = getObjectProperty(properties, 'files');

                if (Array.isArray(metadataFiles)) {
                    // Filter files to keep objects matching schema
                    const filteredFiles = metadataFiles.filter(isFileEntry);

                    setFiles(filteredFiles);
                    setStatus('success');
                } else {
                    throw new Error('Files is not an array');
                }
            } catch (_error) {
                setStatus('error');
            }
        }
        fetchMetadataFiles();
    }, [metadataUri]);

    if (status === 'loading') {
        return <LoadingCard />;
    }

    if (status === 'error') {
        return <ErrorCard text="Failed to fetch files" />;
    }

    const filesList: React.ReactNode[] = files.map(({ uri, type }) => {
        return (
            <BaseTable.Row key={`${uri}:${type}`}>
                <BaseTable.Cell>
                    <ExternalLink href={uri}>{uri}</ExternalLink>
                </BaseTable.Cell>
                <BaseTable.Cell>{type}</BaseTable.Cell>
            </BaseTable.Row>
        );
    });

    return (
        <Card ui="dashkit">
            <CardHeader ui="dashkit">
                <CardTitle as="h3" ui="dashkit">
                    Files
                </CardTitle>
            </CardHeader>
            <BaseTable ui="dashkit" variant="card" nowrap>
                <BaseTable.Head>
                    <BaseTable.Row>
                        <BaseTable.HeaderCell className="w-px text-dk-gray-700">File URI</BaseTable.HeaderCell>
                        <BaseTable.HeaderCell className="w-px text-dk-gray-700">File Type</BaseTable.HeaderCell>
                    </BaseTable.Row>
                </BaseTable.Head>
                <BaseTable.Body>{filesList}</BaseTable.Body>
            </BaseTable>
        </Card>
    );
}

function getObjectProperty(value: unknown, key: string): unknown {
    if (typeof value === 'object' && value) {
        return Reflect.get(value, key);
    }

    return undefined;
}

function isFileEntry(value: unknown): value is File {
    if (typeof value !== 'object' || !value) {
        return false;
    }

    return typeof Reflect.get(value, 'uri') === 'string' && typeof Reflect.get(value, 'type') === 'string';
}
