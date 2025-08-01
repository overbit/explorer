import { MintAccountInfo } from '@/app/validators/accounts/token';

import { isTokenProgramData, ParsedData, TokenProgramData } from '..';

function isMetaplex(parsedData?: ParsedData): parsedData is TokenProgramData {
    return !!(
        parsedData &&
        isTokenProgramData(parsedData) &&
        parsedData.parsed.type === 'mint' &&
        parsedData.nftData?.metadata?.tokenStandard !== null
    );
}

function isMetaplexNFT(parsedData?: ParsedData, mintInfo?: MintAccountInfo): parsedData is TokenProgramData {
    return !!(
        parsedData &&
        isTokenProgramData(parsedData) &&
        parsedData.parsed.type === 'mint' &&
        parsedData.nftData &&
        mintInfo?.decimals === 0 &&
        (parseInt(mintInfo.supply) === 1 ||
            (parsedData.nftData.metadata.tokenStandard != null &&
                [0, 3, 4].includes(parsedData.nftData.metadata.tokenStandard)))
    );
}

function isMetaplexFungibleToken(parsedData?: ParsedData): parsedData is TokenProgramData {
    return !!(
        parsedData &&
        isTokenProgramData(parsedData) &&
        parsedData.parsed.type === 'mint' &&
        parsedData.nftData?.metadata.tokenStandard != null &&
        [1, 2].includes(parsedData.nftData.metadata.tokenStandard)
    );
}

export { isMetaplex, isMetaplexNFT, isMetaplexFungibleToken };
