import { keccak_256 } from '@noble/hashes/sha3';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

import { fromBase64 } from '@/app/shared/lib/bytes';

export const MANIFEST_PROGRAM_ID = 'MNFSTqtC93rEfYHB6hF82sKdZpUDFWkViLByLd1k1Ms';
export const MANIFEST_WRAPPER_PROGRAM_ID = 'wMNFSTkir3HgyZTsB7uqu3i7FA73grFCptPXgrZjksL';
export const MANIFEST_UI_WRAPPER_PROGRAM_ID = 'UMnFStVeG1ecZFc2gc5K3vFy3sMpotq8C91mXBQDGwh';

export type ManifestDecodedField = {
    label: string;
    name: string;
    type: FieldType;
    value: boolean | number | string | number[];
};

export type ManifestDecodedAccount = {
    accountName: string;
    category: 'Log' | 'State';
    discriminator: string;
    discriminatorName: string;
    fields: ManifestDecodedField[];
    title: string;
};

export type ManifestDecodedInstruction = {
    accounts: ManifestInstructionAccount[];
    args: ManifestDecodedField[];
    instructionDiscriminator: number;
    instructionName: string;
    title: string;
};

export type ManifestInstructionAccount = {
    label: string;
    name: string;
};

type FieldType = 'bool' | 'bytes' | 'coptionU32' | 'enum' | 'i8' | 'publicKey' | 'u8' | 'u16' | 'u32' | 'u64' | 'u128';

type FieldDescriptor = Readonly<{
    label?: string;
    name: string;
    type: FieldType;
}>;

type SkipDescriptor = Readonly<{
    name?: string;
    skip: number;
    type: 'skip';
}>;

type LayoutDescriptor = FieldDescriptor | SkipDescriptor;

type AccountLayout = Readonly<{
    accountName: string;
    category: ManifestDecodedAccount['category'];
    discriminatorName: string;
    layout: readonly LayoutDescriptor[];
    offset: number;
    title: string;
}>;

type InstructionLayout = Readonly<{
    accounts: readonly string[];
    decodeArgs?: (reader: Reader) => ManifestDecodedField[];
    instructionDiscriminator: number;
    instructionName: string;
    title: string;
}>;

const ORDER_TYPE_LABELS = ['Limit', 'ImmediateOrCancel', 'PostOnly', 'Global', 'Reverse', 'ReverseTight'];

const MARKET_FIXED_LAYOUT: readonly LayoutDescriptor[] = [
    field('discriminant', 'u64'),
    field('version', 'u8'),
    field('baseMintDecimals', 'u8'),
    field('quoteMintDecimals', 'u8'),
    field('baseVaultBump', 'u8'),
    field('quoteVaultBump', 'u8'),
    skip(3, 'padding1'),
    field('baseMint', 'publicKey'),
    field('quoteMint', 'publicKey'),
    field('baseVault', 'publicKey'),
    field('quoteVault', 'publicKey'),
    field('orderSequenceNumber', 'u64'),
    field('numBytesAllocated', 'u32'),
    field('bidsRootIndex', 'u32'),
    field('bidsBestIndex', 'u32'),
    field('asksRootIndex', 'u32'),
    field('asksBestIndex', 'u32'),
    field('claimedSeatsRootIndex', 'u32'),
    field('freeListHeadIndex', 'u32'),
    skip(4, 'padding2'),
    field('quoteVolume', 'u64'),
    skip(64, 'padding3'),
];

const GLOBAL_FIXED_LAYOUT: readonly LayoutDescriptor[] = [
    field('discriminant', 'u64'),
    field('mint', 'publicKey'),
    field('vault', 'publicKey'),
    field('globalTradersRootIndex', 'u32'),
    field('globalDepositsRootIndex', 'u32'),
    field('globalDepositsMaxIndex', 'u32'),
    field('freeListHeadIndex', 'u32'),
    field('numBytesAllocated', 'u32'),
    field('vaultBump', 'u8'),
    field('globalBump', 'u8'),
    field('numSeatsClaimed', 'u16'),
];

const MARKET_LOG_FIELDS = {
    accountName: 'CreateMarketLog',
    category: 'Log',
    discriminatorName: 'manifest::logs::CreateMarketLog',
    offset: 8,
    title: 'Manifest Create Market Log',
} as const;

const ACCOUNT_LAYOUTS: readonly AccountLayout[] = [
    {
        accountName: 'MarketFixed',
        category: 'State',
        discriminatorName: 'manifest::state::market::MarketFixed',
        layout: MARKET_FIXED_LAYOUT,
        offset: 0,
        title: 'Manifest Market',
    },
    {
        accountName: 'GlobalFixed',
        category: 'State',
        discriminatorName: 'manifest::state::global::GlobalFixed',
        layout: GLOBAL_FIXED_LAYOUT,
        offset: 0,
        title: 'Manifest Global',
    },
    {
        ...MARKET_LOG_FIELDS,
        layout: [
            field('market', 'publicKey'),
            field('creator', 'publicKey'),
            field('baseMint', 'publicKey'),
            field('quoteMint', 'publicKey'),
        ],
    },
    logLayout('ClaimSeatLog', [field('market', 'publicKey'), field('trader', 'publicKey')]),
    logLayout('DepositLog', [
        field('market', 'publicKey'),
        field('trader', 'publicKey'),
        field('mint', 'publicKey'),
        field('amountAtoms', 'u64'),
    ]),
    logLayout('WithdrawLog', [
        field('market', 'publicKey'),
        field('trader', 'publicKey'),
        field('mint', 'publicKey'),
        field('amountAtoms', 'u64'),
    ]),
    logLayout('CancelOrderLog', [
        field('market', 'publicKey'),
        field('trader', 'publicKey'),
        field('orderSequenceNumber', 'u64'),
    ]),
    logLayout('PlaceOrderLog', [
        field('market', 'publicKey'),
        field('trader', 'publicKey'),
        field('price', 'u128'),
        field('baseAtoms', 'u64'),
        field('orderSequenceNumber', 'u64'),
        field('orderIndex', 'u32'),
        field('lastValidSlot', 'u32'),
        field('orderType', 'enum'),
        field('isBid', 'bool'),
        skip(6, 'padding'),
    ]),
    logLayout('FillLog', [
        field('market', 'publicKey'),
        field('maker', 'publicKey'),
        field('taker', 'publicKey'),
        field('baseMint', 'publicKey'),
        field('quoteMint', 'publicKey'),
        field('price', 'u128'),
        field('baseAtoms', 'u64'),
        field('quoteAtoms', 'u64'),
        field('makerSequenceNumber', 'u64'),
        field('takerSequenceNumber', 'u64'),
        field('takerIsBuy', 'bool'),
        field('isMakerGlobal', 'bool'),
        skip(14, 'padding'),
    ]),
    logLayout('GlobalCreateLog', [field('global', 'publicKey'), field('creator', 'publicKey')]),
    logLayout('GlobalAddTraderLog', [field('global', 'publicKey'), field('trader', 'publicKey')]),
    logLayout('GlobalClaimSeatLog', [
        field('global', 'publicKey'),
        field('market', 'publicKey'),
        field('trader', 'publicKey'),
    ]),
    logLayout('GlobalDepositLog', [
        field('global', 'publicKey'),
        field('trader', 'publicKey'),
        field('globalAtoms', 'u64'),
    ]),
    logLayout('GlobalWithdrawLog', [
        field('global', 'publicKey'),
        field('trader', 'publicKey'),
        field('globalAtoms', 'u64'),
    ]),
    logLayout('GlobalEvictLog', [
        field('evictor', 'publicKey'),
        field('evictee', 'publicKey'),
        field('evictorAtoms', 'u64'),
        field('evicteeAtoms', 'u64'),
    ]),
    logLayout('GlobalCleanupLog', [
        field('cleaner', 'publicKey'),
        field('maker', 'publicKey'),
        field('amountDesired', 'u64'),
        field('amountDeposited', 'u64'),
    ]),
];

const ACCOUNT_LAYOUTS_BY_DISCRIMINATOR = new Map(
    ACCOUNT_LAYOUTS.map(layout => [toHex(genManifestAccountDiscriminator(layout.discriminatorName)), layout]),
);

const CANCEL_ORDER_PARAMS_LAYOUT: readonly FieldDescriptor[] = [
    field('orderSequenceNumber', 'u64'),
    field('orderIndexHint', 'coptionU32'),
];

const PLACE_ORDER_PARAMS_LAYOUT: readonly FieldDescriptor[] = [
    field('baseAtoms', 'u64'),
    field('priceMantissa', 'u32'),
    field('priceExponent', 'i8'),
    field('isBid', 'bool'),
    field('lastValidSlot', 'u32'),
    field('orderType', 'enum'),
];

const WRAPPER_CANCEL_ORDER_PARAMS_LAYOUT: readonly FieldDescriptor[] = [field('clientOrderId', 'u64')];

const WRAPPER_PLACE_ORDER_PARAMS_LAYOUT: readonly FieldDescriptor[] = [
    field('clientOrderId', 'u64'),
    field('baseAtoms', 'u64'),
    field('priceMantissa', 'u32'),
    field('priceExponent', 'i8'),
    field('isBid', 'bool'),
    field('lastValidSlot', 'u32'),
    field('orderType', 'enum'),
];

const INSTRUCTION_LAYOUTS: readonly InstructionLayout[] = [
    instructionLayout(0, 'CreateMarket', [
        'payer',
        'market',
        'systemProgram',
        'baseMint',
        'quoteMint',
        'baseVault',
        'quoteVault',
        'tokenProgram',
        'tokenProgram22',
    ]),
    instructionLayout(1, 'ClaimSeat', ['payer', 'market', 'systemProgram']),
    instructionLayout(
        2,
        'Deposit',
        ['payer', 'market', 'traderToken', 'vault', 'tokenProgram', 'mint'],
        decodeAmountWithTraderHintArgs,
    ),
    instructionLayout(
        3,
        'Withdraw',
        ['payer', 'market', 'traderToken', 'vault', 'tokenProgram', 'mint'],
        decodeAmountWithTraderHintArgs,
    ),
    instructionLayout(
        4,
        'Swap',
        [
            'payer',
            'market',
            'systemProgram',
            'traderBase',
            'traderQuote',
            'baseVault',
            'quoteVault',
            'tokenProgramBase',
            'baseMint',
            'tokenProgramQuote',
            'quoteMint',
            'global',
            'globalVault',
        ],
        reader =>
            parseFieldsWithReader(reader, [
                field('params.inAtoms', 'u64', 'Input Atoms'),
                field('params.outAtoms', 'u64', 'Output Atoms'),
                field('params.isBaseIn', 'bool', 'Base Token In'),
                field('params.isExactIn', 'bool', 'Exact In'),
            ]),
    ),
    instructionLayout(5, 'Expand', ['payer', 'market', 'systemProgram']),
    instructionLayout(
        6,
        'BatchUpdate',
        [
            'payer',
            'market',
            'systemProgram',
            'baseMint',
            'baseGlobal',
            'baseGlobalVault',
            'baseMarketVault',
            'baseTokenProgram',
            'quoteMint',
            'quoteGlobal',
            'quoteGlobalVault',
            'quoteMarketVault',
            'quoteTokenProgram',
        ],
        decodeBatchUpdateArgs,
    ),
    instructionLayout(7, 'GlobalCreate', ['payer', 'global', 'systemProgram', 'mint', 'globalVault', 'tokenProgram']),
    instructionLayout(8, 'GlobalAddTrader', ['payer', 'global', 'systemProgram']),
    instructionLayout(
        9,
        'GlobalDeposit',
        ['payer', 'global', 'mint', 'globalVault', 'traderToken', 'tokenProgram'],
        reader => parseFieldsWithReader(reader, [field('params.amountAtoms', 'u64', 'Amount Atoms')]),
    ),
    instructionLayout(
        10,
        'GlobalWithdraw',
        ['payer', 'global', 'mint', 'globalVault', 'traderToken', 'tokenProgram'],
        reader => parseFieldsWithReader(reader, [field('params.amountAtoms', 'u64', 'Amount Atoms')]),
    ),
    instructionLayout(
        11,
        'GlobalEvict',
        ['payer', 'global', 'mint', 'globalVault', 'traderToken', 'evicteeToken', 'tokenProgram', 'systemProgram'],
        reader => parseFieldsWithReader(reader, [field('params.amountAtoms', 'u64', 'Amount Atoms')]),
    ),
    instructionLayout(12, 'GlobalClean', ['payer', 'market', 'systemProgram', 'global'], reader =>
        parseFieldsWithReader(reader, [field('params.orderIndex', 'u32', 'Order Index')]),
    ),
];

const INSTRUCTION_LAYOUTS_BY_DISCRIMINATOR = new Map(
    INSTRUCTION_LAYOUTS.map(layout => [layout.instructionDiscriminator, layout]),
);

const WRAPPER_INSTRUCTION_LAYOUTS: readonly InstructionLayout[] = [
    instructionLayout(0, 'CreateWrapper', ['owner', 'systemProgram', 'wrapperState'], undefined, 'Manifest Wrapper'),
    instructionLayout(
        1,
        'ClaimSeat',
        ['manifestProgram', 'owner', 'market', 'systemProgram', 'wrapperState'],
        undefined,
        'Manifest Wrapper',
    ),
    instructionLayout(
        2,
        'Deposit',
        ['manifestProgram', 'owner', 'market', 'traderTokenAccount', 'vault', 'tokenProgram', 'wrapperState', 'mint'],
        reader => parseFieldsWithReader(reader, [field('params.amountAtoms', 'u64', 'Amount Atoms')]),
        'Manifest Wrapper',
    ),
    instructionLayout(
        3,
        'Withdraw',
        ['manifestProgram', 'owner', 'market', 'traderTokenAccount', 'vault', 'tokenProgram', 'wrapperState', 'mint'],
        reader => parseFieldsWithReader(reader, [field('params.amountAtoms', 'u64', 'Amount Atoms')]),
        'Manifest Wrapper',
    ),
    instructionLayout(
        4,
        'BatchUpdate',
        [
            'wrapperState',
            'manifestProgram',
            'owner',
            'market',
            'systemProgram',
            'baseMint',
            'baseGlobal',
            'baseGlobalVault',
            'baseMarketVault',
            'baseTokenProgram',
            'quoteMint',
            'quoteGlobal',
            'quoteGlobalVault',
            'quoteMarketVault',
            'quoteTokenProgram',
        ],
        decodeWrapperBatchUpdateArgs,
        'Manifest Wrapper',
    ),
    instructionLayout(
        5,
        'BatchUpdateBaseGlobal',
        [
            'wrapperState',
            'manifestProgram',
            'owner',
            'market',
            'systemProgram',
            'baseMint',
            'baseGlobal',
            'baseGlobalVault',
            'baseMarketVault',
            'baseTokenProgram',
        ],
        decodeWrapperBatchUpdateArgs,
        'Manifest Wrapper',
    ),
    instructionLayout(
        6,
        'BatchUpdateQuoteGlobal',
        [
            'wrapperState',
            'manifestProgram',
            'owner',
            'market',
            'systemProgram',
            'quoteMint',
            'quoteGlobal',
            'quoteGlobalVault',
            'quoteMarketVault',
            'quoteTokenProgram',
        ],
        decodeWrapperBatchUpdateArgs,
        'Manifest Wrapper',
    ),
];

const WRAPPER_INSTRUCTION_LAYOUTS_BY_DISCRIMINATOR = new Map(
    WRAPPER_INSTRUCTION_LAYOUTS.map(layout => [layout.instructionDiscriminator, layout]),
);

const UI_WRAPPER_MARKET_ACCOUNTS = [
    'baseMint',
    'baseGlobal',
    'baseGlobalVault',
    'baseMarketVault',
    'baseTokenProgram',
    'quoteMint',
    'quoteGlobal',
    'quoteGlobalVault',
    'quoteMarketVault',
    'quoteTokenProgram',
] as const;

const UI_WRAPPER_PLACE_ORDER_ACCOUNTS = [
    'wrapperState',
    'owner',
    'traderTokenAccount',
    'market',
    'vault',
    'mint',
    'systemProgram',
    'tokenProgram',
    'manifestProgram',
    'payer',
    ...UI_WRAPPER_MARKET_ACCOUNTS,
] as const;

const UI_WRAPPER_INSTRUCTION_LAYOUTS: readonly InstructionLayout[] = [
    instructionLayout(0, 'CreateWrapper', ['owner', 'systemProgram', 'payer', 'wrapperState'], undefined, 'Manifest UI Wrapper'),
    instructionLayout(
        1,
        'ClaimSeatUnused',
        ['manifestProgram', 'owner', 'market', 'systemProgram', 'payer', 'wrapperState'],
        undefined,
        'Manifest UI Wrapper',
    ),
    instructionLayout(
        2,
        'PlaceOrder',
        UI_WRAPPER_PLACE_ORDER_ACCOUNTS,
        decodeUiWrapperPlaceOrderArgs,
        'Manifest UI Wrapper',
    ),
    instructionLayout(
        3,
        'EditOrder',
        UI_WRAPPER_PLACE_ORDER_ACCOUNTS,
        decodeUiWrapperPlaceOrderArgs,
        'Manifest UI Wrapper',
    ),
    instructionLayout(
        4,
        'CancelOrder',
        [
            'wrapperState',
            'owner',
            'traderTokenAccount',
            'market',
            'vault',
            'mint',
            'systemProgram',
            'tokenProgram',
            'manifestProgram',
        ],
        reader => parseFieldsWithReader(reader, WRAPPER_CANCEL_ORDER_PARAMS_LAYOUT, 'params.'),
        'Manifest UI Wrapper',
    ),
    instructionLayout(
        5,
        'SettleFunds',
        [
            'wrapperState',
            'owner',
            'traderTokenAccountBase',
            'traderTokenAccountQuote',
            'market',
            'vaultBase',
            'vaultQuote',
            'mintBase',
            'mintQuote',
            'tokenProgramBase',
            'tokenProgramQuote',
            'manifestProgram',
            'platformTokenAccount',
            'referrerTokenAccount',
        ],
        reader =>
            parseFieldsWithReader(reader, [
                field('params.feeMantissa', 'u32', 'Fee Mantissa'),
                field('params.platformFeePercent', 'u8', 'Platform Fee Percent'),
            ]),
        'Manifest UI Wrapper',
    ),
];

const UI_WRAPPER_INSTRUCTION_LAYOUTS_BY_DISCRIMINATOR = new Map(
    UI_WRAPPER_INSTRUCTION_LAYOUTS.map(layout => [layout.instructionDiscriminator, layout]),
);

export function isManifestProgramId(programId: PublicKey | string): boolean {
    return programId.toString() === MANIFEST_PROGRAM_ID;
}

export function isManifestWrapperProgramId(programId: PublicKey | string): boolean {
    return programId.toString() === MANIFEST_WRAPPER_PROGRAM_ID || programId.toString() === MANIFEST_UI_WRAPPER_PROGRAM_ID;
}

export function decodeManifestAccount(data: Uint8Array): ManifestDecodedAccount | undefined {
    if (data.length < 8) return;

    const discriminator = toHex(data.subarray(0, 8));
    const layout = ACCOUNT_LAYOUTS_BY_DISCRIMINATOR.get(discriminator);
    if (!layout) return;

    try {
        return {
            accountName: layout.accountName,
            category: layout.category,
            discriminator,
            discriminatorName: layout.discriminatorName,
            fields: parseFields(data, layout),
            title: layout.title,
        };
    } catch (_error) {
        return;
    }
}

export function decodeManifestEvent(data: string | Uint8Array): ManifestDecodedAccount | undefined {
    const decoded = decodeManifestAccount(typeof data === 'string' ? fromBase64(data) : data);
    if (decoded?.category !== 'Log') return;
    return decoded;
}

export function decodeManifestInstruction(data: Uint8Array): ManifestDecodedInstruction | undefined {
    return decodeInstruction(data, INSTRUCTION_LAYOUTS_BY_DISCRIMINATOR);
}

export function decodeManifestWrapperInstruction(
    data: Uint8Array,
    programId?: PublicKey | string,
): ManifestDecodedInstruction | undefined {
    const layouts =
        programId?.toString() === MANIFEST_UI_WRAPPER_PROGRAM_ID
            ? UI_WRAPPER_INSTRUCTION_LAYOUTS_BY_DISCRIMINATOR
            : WRAPPER_INSTRUCTION_LAYOUTS_BY_DISCRIMINATOR;

    return decodeInstruction(data, layouts);
}

function decodeInstruction(
    data: Uint8Array,
    layoutsByDiscriminator: Map<number, InstructionLayout>,
): ManifestDecodedInstruction | undefined {
    if (data.length < 1) return;

    const instructionDiscriminator = data[0];
    const layout = layoutsByDiscriminator.get(instructionDiscriminator);
    if (!layout) return;

    try {
        const reader = new Reader(data, 1);
        return {
            accounts: layout.accounts.map(name => ({ label: titleCase(name), name })),
            args: layout.decodeArgs?.(reader) ?? [],
            instructionDiscriminator,
            instructionName: layout.instructionName,
            title: layout.title,
        };
    } catch (_error) {
        return;
    }
}

export function genManifestAccountDiscriminator(accountName: string): Uint8Array {
    const programBytes = bs58.decode(MANIFEST_PROGRAM_ID);
    const accountNameBytes = new TextEncoder().encode(accountName);
    const input = new Uint8Array(programBytes.length + accountNameBytes.length);
    input.set(programBytes, 0);
    input.set(accountNameBytes, programBytes.length);
    return keccak_256(input).subarray(0, 8);
}

function parseFields(data: Uint8Array, layout: AccountLayout): ManifestDecodedField[] {
    const reader = new Reader(data, layout.offset);

    return parseFieldsWithReader(reader, layout.layout);
}

function parseFieldsWithReader(reader: Reader, layout: readonly LayoutDescriptor[], prefix = ''): ManifestDecodedField[] {
    const fields: ManifestDecodedField[] = [];

    for (const descriptor of layout) {
        if (descriptor.type === 'skip') {
            reader.skip(descriptor.skip);
            continue;
        }

        fields.push({
            label: descriptor.label ?? titleCase(descriptor.name),
            name: `${prefix}${descriptor.name}`,
            type: descriptor.type,
            value: reader.read(descriptor.type),
        });
    }

    return fields;
}

function field(name: string, type: FieldType, label?: string): FieldDescriptor {
    return { label, name, type };
}

function skip(byteLength: number, name?: string): SkipDescriptor {
    return { name, skip: byteLength, type: 'skip' };
}

function logLayout(accountName: string, layout: readonly LayoutDescriptor[]): AccountLayout {
    return {
        accountName,
        category: 'Log',
        discriminatorName: `manifest::logs::${accountName}`,
        layout,
        offset: 8,
        title: `Manifest ${titleCase(accountName)}`,
    };
}

function instructionLayout(
    instructionDiscriminator: number,
    instructionName: string,
    accounts: readonly string[],
    decodeArgs?: (reader: Reader) => ManifestDecodedField[],
    programName = 'Manifest',
): InstructionLayout {
    return {
        accounts,
        decodeArgs,
        instructionDiscriminator,
        instructionName,
        title: `${programName} ${titleCase(instructionName)}`,
    };
}

function decodeBatchUpdateArgs(reader: Reader): ManifestDecodedField[] {
    const fields = parseFieldsWithReader(reader, [field('traderIndexHint', 'coptionU32', 'Trader Index Hint')]);

    const cancelsLength = reader.read('u32') as number;
    fields.push(decodedField('cancels.length', 'Cancels', 'u32', cancelsLength));
    for (let i = 0; i < cancelsLength; i++) {
        fields.push(...parseFieldsWithReader(reader, CANCEL_ORDER_PARAMS_LAYOUT, `cancels[${i}].`));
    }

    const ordersLength = reader.read('u32') as number;
    fields.push(decodedField('orders.length', 'Orders', 'u32', ordersLength));
    for (let i = 0; i < ordersLength; i++) {
        fields.push(...parseFieldsWithReader(reader, PLACE_ORDER_PARAMS_LAYOUT, `orders[${i}].`));
    }

    return fields;
}

function decodeAmountWithTraderHintArgs(reader: Reader): ManifestDecodedField[] {
    const fields = parseFieldsWithReader(reader, [
        field('params.amountAtoms', 'u64', 'Amount Atoms'),
        field('params.traderIndexHint', 'coptionU32', 'Trader Index Hint'),
    ]);

    if (reader.remaining() > 0) {
        fields.push(
            ...parseFieldsWithReader(reader, [
                field('traderIndexHint', 'coptionU32', 'Instruction Trader Index Hint'),
            ]),
        );
    }

    return fields;
}

function decodeWrapperBatchUpdateArgs(reader: Reader): ManifestDecodedField[] {
    const fields: ManifestDecodedField[] = [];

    const cancelsLength = reader.read('u32') as number;
    fields.push(decodedField('cancels.length', 'Cancels', 'u32', cancelsLength));
    for (let i = 0; i < cancelsLength; i++) {
        fields.push(...parseFieldsWithReader(reader, WRAPPER_CANCEL_ORDER_PARAMS_LAYOUT, `cancels[${i}].`));
    }

    fields.push(...parseFieldsWithReader(reader, [field('cancelAll', 'bool', 'Cancel All')]));

    const ordersLength = reader.read('u32') as number;
    fields.push(decodedField('orders.length', 'Orders', 'u32', ordersLength));
    for (let i = 0; i < ordersLength; i++) {
        fields.push(...parseFieldsWithReader(reader, WRAPPER_PLACE_ORDER_PARAMS_LAYOUT, `orders[${i}].`));
    }

    return fields;
}

function decodeUiWrapperPlaceOrderArgs(reader: Reader): ManifestDecodedField[] {
    return parseFieldsWithReader(reader, WRAPPER_PLACE_ORDER_PARAMS_LAYOUT, 'params.');
}

function decodedField(
    name: string,
    label: string,
    type: FieldType,
    value: ManifestDecodedField['value'],
): ManifestDecodedField {
    return { label, name, type, value };
}

function titleCase(value: string): string {
    const source = value.endsWith('Log') ? `${value.slice(0, -3)} Log` : value;
    let result = '';

    for (let i = 0; i < source.length; i++) {
        const char = source[i];
        const previous = source[i - 1];
        if (i > 0 && previous !== ' ' && isLowercaseOrDigit(previous) && isUppercase(char)) {
            result += ' ';
        }
        result += i === 0 ? char.toUpperCase() : char;
    }

    return result;
}

function isLowercaseOrDigit(char: string): boolean {
    const code = char.charCodeAt(0);
    return (code >= 97 && code <= 122) || (code >= 48 && code <= 57);
}

function isUppercase(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 65 && code <= 90;
}

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

class Reader {
    private readonly view: DataView;
    private offset: number;

    constructor(
        private readonly data: Uint8Array,
        offset: number,
    ) {
        this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        this.offset = offset;
    }

    read(type: FieldType): ManifestDecodedField['value'] {
        switch (type) {
            case 'bool':
                return this.readU8() !== 0;
            case 'bytes':
                return this.readBytes(0);
            case 'coptionU32':
                return this.readCOptionU32();
            case 'enum': {
                const value = this.readU8();
                return ORDER_TYPE_LABELS[value] ?? value;
            }
            case 'i8':
                return this.readI8();
            case 'publicKey':
                return this.readPublicKey();
            case 'u8':
                return this.readU8();
            case 'u16':
                return this.readU16();
            case 'u32':
                return this.readU32();
            case 'u64':
                return this.readU64();
            case 'u128':
                return this.readU128();
        }
    }

    skip(byteLength: number) {
        this.ensure(byteLength);
        this.offset += byteLength;
    }

    remaining(): number {
        return this.data.length - this.offset;
    }

    private readBytes(byteLength: number): number[] {
        this.ensure(byteLength);
        const bytes = Array.from(this.data.subarray(this.offset, this.offset + byteLength));
        this.offset += byteLength;
        return bytes;
    }

    private readPublicKey(): string {
        this.ensure(32);
        const publicKey = new PublicKey(this.data.subarray(this.offset, this.offset + 32));
        this.offset += 32;
        return publicKey.toBase58();
    }

    private readU8(): number {
        this.ensure(1);
        const value = this.view.getUint8(this.offset);
        this.offset += 1;
        return value;
    }

    private readI8(): number {
        this.ensure(1);
        const value = this.view.getInt8(this.offset);
        this.offset += 1;
        return value;
    }

    private readU16(): number {
        this.ensure(2);
        const value = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return value;
    }

    private readU32(): number {
        this.ensure(4);
        const value = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return value;
    }

    private readU64(): string {
        this.ensure(8);
        const value = this.view.getBigUint64(this.offset, true).toString();
        this.offset += 8;
        return value;
    }

    private readU128(): string {
        this.ensure(16);
        const low = this.view.getBigUint64(this.offset, true);
        const high = this.view.getBigUint64(this.offset + 8, true);
        this.offset += 16;
        return ((high << 64n) | low).toString();
    }

    private readCOptionU32(): number | string {
        const tag = this.readU8();
        if (tag === 0) return 'None';
        if (tag === 1) return this.readU32();
        throw new Error(`Unexpected Manifest COption tag: ${tag}`);
    }

    private ensure(byteLength: number) {
        if (this.offset + byteLength > this.data.length) {
            throw new Error('Manifest account data is shorter than expected');
        }
    }
}
