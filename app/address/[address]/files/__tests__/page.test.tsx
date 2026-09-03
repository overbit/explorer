import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import MetaplexFilesPage from '../page';

// Mock the page-client component
vi.mock('../page-client', () => ({
    default: ({ params }: { params: { address: string } }) => (
        <div data-testid="metaplex-files-page-client">Metaplex Files for address: {params.address}</div>
    ),
}));

describe('MetaplexFilesPage', () => {
    it('should render the page with correct props', async () => {
        const props = {
            params: Promise.resolve({
                address: 'DemoKeypair1111111111111111111111111111111111',
            }),
        };

        render(await MetaplexFilesPage(props));

        expect(screen.getByTestId('metaplex-files-page-client')).toBeInTheDocument();
        expect(
            screen.getByText('Metaplex Files for address: DemoKeypair1111111111111111111111111111111111'),
        ).toBeInTheDocument();
    });

    it('should pass the address parameter correctly', async () => {
        const testAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
        const props = {
            params: Promise.resolve({
                address: testAddress,
            }),
        };

        render(await MetaplexFilesPage(props));

        expect(screen.getByText(`Metaplex Files for address: ${testAddress}`)).toBeInTheDocument();
    });
});
