import { buttonVariants } from '@components/shared/ui/button';
import { cn } from '@components/shared/utils';
import { ClusterStatus } from '@utils/cluster';
import { cva } from 'class-variance-authority';

// The pill every switcher entry renders as, shared so the active one looks the same in either list.
//
// Base = dashkit Button base + full width (legacy `btn col-12`); active states keep the transparent base
// bg with the status color on border+text (legacy `border-* text-*` utilities).
//
// Every `text-*` here needs its `hover:text-*` twin: these render as `<a>`, and styles.css `a:hover`
// (0,1,1) outranks a bare `text-*` class (0,1,0), so without the twin the dashkit link green wins on
// hover and the text stops matching the border. `hover:text-*` is (0,2,0) and takes it back.
export const clusterButtonVariants = cva(cn(buttonVariants({ size: 'default', ui: 'dashkit' }), 'w-full'), {
    compoundVariants: [
        {
            active: true,
            className: 'border-dk-primary-on-dark text-dk-primary-on-dark hover:text-dk-primary-on-dark',
            status: ClusterStatus.Connected,
        },
        {
            active: true,
            className: 'border-dk-warning-on-dark text-dk-warning-on-dark hover:text-dk-warning-on-dark',
            status: ClusterStatus.Connecting,
        },
        {
            active: true,
            className: 'border-dk-danger text-dk-danger hover:text-dk-danger',
            status: ClusterStatus.Failure,
        },
    ],
    defaultVariants: {
        active: false,
    },
    variants: {
        active: {
            false: 'bg-dk-gray-800-dark border-dk-gray-600-dark text-white hover:bg-[#080808] hover:border-[#151515] hover:text-white',
            true: '',
        },
        status: {
            [ClusterStatus.Connected]: '',
            [ClusterStatus.Connecting]: '',
            [ClusterStatus.Failure]: '',
        },
    },
});
