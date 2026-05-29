import { Address } from '@components/common/Address';
import { SolBalance } from '@components/common/SolBalance';
import { useRefreshAccount } from '@entities/account';
import { AccountCard } from '@features/account';
import { Account } from '@providers/accounts';
import { PublicKey } from '@solana/web3.js';
import React from 'react';

import { decodeManifestAccount, ManifestDecodedField } from '@/app/utils/manifest';

export function ManifestAccountSection({ account, data }: { account: Account; data: Uint8Array }) {
    const refresh = useRefreshAccount();
    const decoded = React.useMemo(() => decodeManifestAccount(data), [data]);

    if (!decoded) return null;

    return (
        <AccountCard
            title={decoded.title}
            account={account}
            analyticsSection="manifest_account_section"
            refresh={() => refresh(account.pubkey, 'parsed')}
        >
            <tr>
                <td>Address</td>
                <td className="text-lg-end">
                    <Address pubkey={account.pubkey} alignRight raw />
                </td>
            </tr>
            <tr>
                <td>Balance (SOL)</td>
                <td className="text-lg-end">
                    <SolBalance lamports={account.lamports} />
                </td>
            </tr>
            <tr>
                <td>Manifest Account Type</td>
                <td className="text-lg-end">{decoded.accountName}</td>
            </tr>
            <tr>
                <td>Manifest Category</td>
                <td className="text-lg-end">{decoded.category}</td>
            </tr>
            <tr>
                <td>Discriminator</td>
                <td className="font-monospace text-lg-end">{decoded.discriminator}</td>
            </tr>
            {decoded.fields.map(field => (
                <tr key={field.name}>
                    <td>{field.label}</td>
                    <td className="text-lg-end">{renderManifestField(field)}</td>
                </tr>
            ))}
        </AccountCard>
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
