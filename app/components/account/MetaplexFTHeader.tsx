import { ArtContent } from '@components/common/NFTArt';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { NFTData } from '@providers/accounts';
import React, { createRef } from 'react';
import useAsyncEffect from 'use-async-effect';

const metaplexTokenStandardLabels: Record<TokenStandard, string> = {
    '0': 'Non-Fungible',
    '1': 'Fungible Asset',
    '2': 'Fungible',
    '3': 'Non-Fungible Edition',
};

export function MetaplexFungibleTokenHeader({ nftData, address }: { nftData: NFTData; address: string }) {
    const metadata = nftData.metadata;
    const data = nftData.json;
    const dropdownRef = createRef<HTMLButtonElement>();

    useAsyncEffect(
        async isMounted => {
            if (!dropdownRef.current) {
                return;
            }
            const Dropdown = (await import('bootstrap/js/dist/dropdown')).default;
            if (!isMounted || !dropdownRef.current) {
                return;
            }
            return new Dropdown(dropdownRef.current);
        },
        dropdown => {
            if (dropdown) {
                dropdown.dispose();
            }
        },
        [dropdownRef]
    );

    return (
        <div className="row">
            <div className="col-auto ms-2 d-flex align-items-center">
                <ArtContent pubkey={address} data={data} category="image" />
            </div>
            <div className="col mb-3 ms-0.5 mt-3">
                {
                    <h6 className="header-pretitle ms-1">
                        Metaplex {metaplexTokenStandardLabels[metadata.tokenStandard ?? '1']} Token
                    </h6>
                }
                <div className="d-flex align-items-center">
                    <h2 className="header-title ms-1 align-items-center no-overflow-with-ellipsis">
                        {metadata.data.name !== '' ? metadata.data.name : 'No NFT name was found'}
                    </h2>
                </div>
                <h4 className="header-pretitle ms-1 mt-1 no-overflow-with-ellipsis">
                    {metadata.data.symbol !== '' ? metadata.data.symbol : 'No Symbol was found'}
                </h4>
            </div>
        </div>
    );
}
