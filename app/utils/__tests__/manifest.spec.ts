import { PublicKey } from '@solana/web3.js';
import { describe, expect, it } from 'vitest';

import { fromHex, toBase64 } from '@/app/shared/lib/bytes';

import {
    decodeManifestAccount,
    decodeManifestEvent,
    decodeManifestInstruction,
    decodeManifestWrapperInstruction,
    genManifestAccountDiscriminator,
    MANIFEST_UI_WRAPPER_PROGRAM_ID,
} from '../manifest';

describe('Manifest account decoding', () => {
    it('should matches Manifest state discriminators', () => {
        const marketDiscriminator = genManifestAccountDiscriminator('manifest::state::market::MarketFixed');
        const globalDiscriminator = genManifestAccountDiscriminator('manifest::state::global::GlobalFixed');

        expect(Buffer.from(marketDiscriminator).toString('hex')).toBe('f0af618f939f7143');
        expect(Buffer.from(globalDiscriminator).toString('hex')).toBe('01aa972fbba0b495');
    });

    it('should decodes the fixed header of a market account', () => {
        const data = new Uint8Array(256);
        const view = new DataView(data.buffer);
        const baseMint = new PublicKey('So11111111111111111111111111111111111111112');
        const quoteMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

        data.set(genManifestAccountDiscriminator('manifest::state::market::MarketFixed'), 0);
        view.setUint8(8, 1);
        view.setUint8(9, 9);
        view.setUint8(10, 6);
        data.set(baseMint.toBytes(), 16);
        data.set(quoteMint.toBytes(), 48);
        view.setBigUint64(144, 42n, true);
        view.setUint32(152, 256, true);

        const decoded = decodeManifestAccount(data);

        expect(decoded?.accountName).toBe('MarketFixed');
        expect(decoded?.fields.find(field => field.name === 'baseMint')?.value).toBe(baseMint.toBase58());
        expect(decoded?.fields.find(field => field.name === 'quoteMint')?.value).toBe(quoteMint.toBase58());
        expect(decoded?.fields.find(field => field.name === 'orderSequenceNumber')?.value).toBe('42');
    });

    it('should decodes log accounts after the first eight discriminator bytes', () => {
        const data = new Uint8Array(8 + 72);
        const view = new DataView(data.buffer);
        const market = new PublicKey('2UuFPdNoKhD1wKqXdNxiWbS3B5wQ9DgxtstNVwZ5jbS4');
        const trader = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZW9GoP4ZDG8xRXxS');

        data.set(genManifestAccountDiscriminator('manifest::logs::CancelOrderLog'), 0);
        data.set(market.toBytes(), 8);
        data.set(trader.toBytes(), 40);
        view.setBigUint64(72, 7n, true);

        const decoded = decodeManifestAccount(data);

        expect(decoded?.accountName).toBe('CancelOrderLog');
        expect(decoded?.fields.find(field => field.name === 'market')?.value).toBe(market.toBase58());
        expect(decoded?.fields.find(field => field.name === 'trader')?.value).toBe(trader.toBase58());
        expect(decoded?.fields.find(field => field.name === 'orderSequenceNumber')?.value).toBe('7');
    });

    it('should decodes emitted Manifest event data from base64', () => {
        const data = new Uint8Array(8 + 72);
        const view = new DataView(data.buffer);
        const market = new PublicKey('2UuFPdNoKhD1wKqXdNxiWbS3B5wQ9DgxtstNVwZ5jbS4');
        const trader = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZW9GoP4ZDG8xRXxS');

        data.set(genManifestAccountDiscriminator('manifest::logs::CancelOrderLog'), 0);
        data.set(market.toBytes(), 8);
        data.set(trader.toBytes(), 40);
        view.setBigUint64(72, 11n, true);

        const decoded = decodeManifestEvent(toBase64(data));

        expect(decoded?.accountName).toBe('CancelOrderLog');
        expect(decoded?.fields.find(field => field.name === 'orderSequenceNumber')?.value).toBe('11');
    });

    it('should decodes Manifest instruction data and coption args', () => {
        const data = new Uint8Array(1 + 8 + 1 + 4);
        const view = new DataView(data.buffer);

        view.setUint8(0, 2); // Deposit
        view.setBigUint64(1, 123n, true);
        view.setUint8(9, 1);
        view.setUint32(10, 5, true);

        const decoded = decodeManifestInstruction(data);

        expect(decoded?.instructionName).toBe('Deposit');
        expect(decoded?.accounts.map(account => account.name)).toEqual([
            'payer',
            'market',
            'traderToken',
            'vault',
            'tokenProgram',
            'mint',
        ]);
        expect(decoded?.args.find(field => field.name === 'params.amountAtoms')?.value).toBe('123');
        expect(decoded?.args.find(field => field.name === 'params.traderIndexHint')?.value).toBe(5);
        expect(decoded?.args.find(field => field.name === 'traderIndexHint')).toBeUndefined();
    });

    it('should decodes observed Manifest wrapper deposit data', () => {
        const data = fromHex('02002d310100000000');

        const decoded = decodeManifestWrapperInstruction(data);

        expect(decoded?.title).toBe('Manifest Wrapper Deposit');
        expect(decoded?.accounts.map(account => account.name)).toEqual([
            'manifestProgram',
            'owner',
            'market',
            'traderTokenAccount',
            'vault',
            'tokenProgram',
            'wrapperState',
            'mint',
        ]);
        expect(decoded?.args.find(field => field.name === 'params.amountAtoms')?.value).toBe('20000000');
    });

    it('should decodes observed Manifest wrapper batch update data', () => {
        const data = fromHex('04000000000001000000e803000000000000002d310100000000008c8647f7000000000000');

        const decoded = decodeManifestWrapperInstruction(data);

        expect(decoded?.title).toBe('Manifest Wrapper Batch Update');
        expect(decoded?.args.find(field => field.name === 'cancels.length')?.value).toBe(0);
        expect(decoded?.args.find(field => field.name === 'cancelAll')?.value).toBe(false);
        expect(decoded?.args.find(field => field.name === 'orders.length')?.value).toBe(1);
        expect(decoded?.args.find(field => field.name === 'orders[0].clientOrderId')?.value).toBe('1000');
        expect(decoded?.args.find(field => field.name === 'orders[0].baseAtoms')?.value).toBe('20000000');
        expect(decoded?.args.find(field => field.name === 'orders[0].priceMantissa')?.value).toBe(1200000000);
        expect(decoded?.args.find(field => field.name === 'orders[0].priceExponent')?.value).toBe(-9);
        expect(decoded?.args.find(field => field.name === 'orders[0].isBid')?.value).toBe(false);
        expect(decoded?.args.find(field => field.name === 'orders[0].orderType')?.value).toBe('Limit');
    });

    it('should decodes observed Manifest UI wrapper create data', () => {
        const data = fromHex('00');

        const decoded = decodeManifestWrapperInstruction(data, MANIFEST_UI_WRAPPER_PROGRAM_ID);

        expect(decoded?.title).toBe('Manifest UI Wrapper Create Wrapper');
        expect(decoded?.accounts.map(account => account.name)).toEqual([
            'owner',
            'systemProgram',
            'payer',
            'wrapperState',
        ]);
    });

    it('should decodes observed Manifest UI wrapper place order data', () => {
        const data = fromHex('02e8030000000000008096980000000000002f6859f7000000000000');

        const decoded = decodeManifestWrapperInstruction(data, MANIFEST_UI_WRAPPER_PROGRAM_ID);

        expect(decoded?.title).toBe('Manifest UI Wrapper Place Order');
        expect(decoded?.accounts.slice(0, 10).map(account => account.name)).toEqual([
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
        ]);
        expect(decoded?.args.find(field => field.name === 'params.clientOrderId')?.value).toBe('1000');
        expect(decoded?.args.find(field => field.name === 'params.baseAtoms')?.value).toBe('10000000');
        expect(decoded?.args.find(field => field.name === 'params.priceMantissa')?.value).toBe(1500000000);
        expect(decoded?.args.find(field => field.name === 'params.priceExponent')?.value).toBe(-9);
        expect(decoded?.args.find(field => field.name === 'params.isBid')?.value).toBe(false);
        expect(decoded?.args.find(field => field.name === 'params.lastValidSlot')?.value).toBe(0);
        expect(decoded?.args.find(field => field.name === 'params.orderType')?.value).toBe('Limit');
    });
});
