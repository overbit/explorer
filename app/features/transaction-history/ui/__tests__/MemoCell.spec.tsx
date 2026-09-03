import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MemoCell } from '../MemoCell';

describe('MemoCell', () => {
    it('should strip RPC length prefixes from the displayed memo', () => {
        render(<MemoCell memo="[5] hello" />);

        expect(screen.getByText('hello')).toBeInTheDocument();
        expect(screen.queryByText('[5] hello')).not.toBeInTheDocument();
    });

    it('should truncate long memo text in the table', () => {
        render(<MemoCell memo="This memo is longer than twenty-five characters" />);

        expect(screen.getByText('This memo is longer than ...')).toBeInTheDocument();
    });
});
