// TODO(fsd): relocate this module to @shared or the appropriate feature/entity layer.
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/app/components/shared/utils';

// `ui` picks the visual lineage, mirroring BaseCard / BaseTable. `dashkit` emits the raw Bootstrap
// `.badge` + `.bg-*-soft` / `.bg-*` classes that the rest of the app currently uses so migrations don't
// change visuals; the dashkit branch + the dashkit-only variant values get deleted once the dashkit
// SCSS is gone.
const badgeVariants = cva([], {
    compoundVariants: [
        // ===== ui="tw" =====
        {
            class: cn(
                'inline-flex items-center justify-center',
                // whitespace-normal (not nowrap): a tw badge whose text is wider than the space it
                // sits in wraps to a second line instead of overflowing. w-fit still shrinks it to
                // content when there's room.
                'px-1.5 py-0.5 font-medium w-fit whitespace-normal shrink-0',
                '[&_svg]:size-3 gap-1 [&_svg]:pointer-events-none',
            ),
            ui: 'tw',
        },
        { as: 'badge', class: 'rounded-md', ui: 'tw' },
        { as: 'link', class: 'rounded-sm', size: 'xs', ui: 'tw' },
        {
            as: 'link',
            class: 'py-0.5 px-2 text-[0.8125rem] leading-[1.75] rounded',
            size: 'sm',
            ui: 'tw',
        },
        { as: 'link', class: 'rounded-md', size: 'md', ui: 'tw' },
        { as: 'link', class: 'rounded-md', size: 'lg', ui: 'tw' },
        { class: 'text-lg', size: 'lg', ui: 'tw' },
        { class: 'text-md', size: 'md', ui: 'tw' },
        { class: 'text-sm', size: 'sm', ui: 'tw' },
        { class: 'text-xs', size: 'xs', ui: 'tw' },
        { class: 'shadow-active', status: 'active', ui: 'tw' },
        // --- tw / tone="original" — the standard Tailwind-palette treatment (default for tw). ---
        {
            class: 'border-transparent text-neutral-200 [&_a]:text-neutral-200 [&[href]]:hover:text-neutral-200 [&_a]:hover:text-neutral-200',
            tone: 'original',
            ui: 'tw',
            variant: 'default',
        },
        {
            class: 'border-transparent bg-destructive text-white [&_a]:text-white [&[href]]:hover:text-white [&_a]:hover:text-white',
            tone: 'original',
            ui: 'tw',
            variant: 'destructive',
        },
        {
            class: 'border-transparent bg-red-950 text-red-400 [&_a]:text-red-400 [&[href]]:hover:text-red-400 [&_a]:hover:text-red-400',
            tone: 'original',
            ui: 'tw',
            variant: 'danger',
        },
        {
            class: 'border-transparent bg-teal-900 text-teal-400 [&_a]:text-teal-400 [&[href]]:hover:text-teal-400 [&_a]:hover:text-teal-400',
            tone: 'original',
            ui: 'tw',
            variant: 'info',
        },
        {
            class: 'border-transparent bg-neutral-400 text-neutral-800 [&_a]:text-neutral-800 [&[href]]:hover:text-neutral-800 [&_a]:hover:text-neutral-800',
            tone: 'original',
            ui: 'tw',
            variant: 'secondary',
        },
        {
            class: 'border-transparent bg-green-900 text-green-400 [&_a]:text-green-400 [&[href]]:hover:text-green-400 [&_a]:hover:text-green-400',
            tone: 'original',
            ui: 'tw',
            variant: 'success',
        },
        {
            class: 'border-transparent bg-transparent text-neutral-200 [&_a]:text-neutral-200 [&[href]]:hover:text-neutral-200 [&_a]:hover:text-neutral-200',
            tone: 'original',
            ui: 'tw',
            variant: 'transparent',
        },
        {
            class: 'border-transparent bg-orange-950 text-orange-400 [&_a]:text-orange-400 [&[href]]:hover:text-orange-400 [&_a]:hover:text-orange-400',
            tone: 'original',
            ui: 'tw',
            variant: 'warning',
        },
        {
            class: 'border-transparent bg-green-950 text-green-900 [&_a]:text-green-900 [&[href]]:hover:text-green-900 [&_a]:hover:text-green-900',
            tone: 'original',
            ui: 'tw',
            variant: 'dark',
        },
        {
            class: 'border-transparent bg-gray-700 text-gray-400 [&_a]:text-gray-400 [&[href]]:hover:text-gray-400 [&_a]:hover:text-gray-400',
            tone: 'original',
            ui: 'tw',
            variant: 'gray',
        },

        {
            class: 'border-transparent text-neutral-200 [&_a]:text-neutral-200 [&[href]]:hover:text-neutral-200 [&_a]:hover:text-neutral-200',
            tone: 'soft',
            ui: 'tw',
            variant: 'default',
        },
        {
            class: 'border-transparent bg-purple-900 text-purple-500 [&_a]:text-purple-500 [&[href]]:hover:text-purple-500 [&_a]:hover:text-purple-500',
            tone: 'soft',
            ui: 'tw',
            variant: 'destructive',
        },
        {
            class: 'border-transparent bg-purple-900 text-purple-500 [&_a]:text-purple-500 [&[href]]:hover:text-purple-500 [&_a]:hover:text-purple-500',
            tone: 'soft',
            ui: 'tw',
            variant: 'danger',
        },
        {
            class: 'border-transparent bg-teal-900 text-teal-400 [&_a]:text-teal-400 [&[href]]:hover:text-teal-400 [&_a]:hover:text-teal-400',
            tone: 'soft',
            ui: 'tw',
            variant: 'info',
        },
        {
            class: 'border-transparent bg-gray-800 text-gray-500 [&_a]:text-gray-500 [&[href]]:hover:text-gray-500 [&_a]:hover:text-gray-500',
            tone: 'soft',
            ui: 'tw',
            variant: 'secondary',
        },
        {
            class: 'border-transparent bg-gray-700 text-gray-400 [&_a]:text-gray-400 [&[href]]:hover:text-gray-400 [&_a]:hover:text-gray-400',
            tone: 'soft',
            ui: 'tw',
            variant: 'gray',
        },
        {
            class: 'border-transparent bg-green-950 text-green-900 [&_a]:text-green-900 [&[href]]:hover:text-green-900 [&_a]:hover:text-green-900',
            tone: 'soft',
            ui: 'tw',
            variant: 'dark',
        },
        {
            class: 'border-transparent bg-green-800 text-green-400 [&_a]:text-green-400 [&[href]]:hover:text-green-400 [&_a]:hover:text-green-400',
            tone: 'soft',
            ui: 'tw',
            variant: 'success',
        },
        {
            class: 'border-transparent bg-transparent text-neutral-200 [&_a]:text-neutral-200 [&[href]]:hover:text-neutral-200 [&_a]:hover:text-neutral-200',
            tone: 'soft',
            ui: 'tw',
            variant: 'transparent',
        },
        {
            class: 'border-transparent bg-fuchsia-900 text-fuchsia-400 [&_a]:text-fuchsia-400 [&[href]]:hover:text-fuchsia-400 [&_a]:hover:text-fuchsia-400',
            tone: 'soft',
            ui: 'tw',
            variant: 'warning',
        },

        // ===== ui="dashkit" =====
        // Base `.badge` layout, matching dashkit `_badge.scss` + Bootstrap `.badge`:
        // 76% font-size, line-height 1, vertical-align middle, em-based padding (0.33em y, 0.5em x).
        // Padding-x and rounded live on per-pill compounds — cn (clsx) keeps all classes, so
        // non-pill horizontal padding/rounded would beat the pill compound's
        // arbitrary values in CSS source order if listed here.
        {
            class: 'inline-block align-middle text-center whitespace-nowrap font-normal leading-none text-[76%] py-[0.33em] empty:hidden',
            ui: 'dashkit',
        },
        // pill=false: dashkit default — em-based horizontal padding + Bootstrap radius.
        { class: 'px-[0.5em] rounded-[0.375rem]', pill: false, ui: 'dashkit' },
        // size="sm" in dashkit mode mirrors the in-table appearance (parent `<td>` with 13px font
        // → ≈10px). Useful when rendering a dashkit badge OUTSIDE a table while still wanting the compact look.
        { class: 'text-dk-xs', size: 'sm', ui: 'dashkit' },
        {
            class: 'bg-dk-success-on-dark/20 text-dk-success-on-dark [&[href]]:hover:bg-dk-success-on-dark/30 [&[href]]:focus:bg-dk-success-on-dark/30',
            tone: 'soft',
            ui: 'dashkit',
            variant: 'success',
        },
        {
            class: 'bg-dk-info/20 text-dk-info [&[href]]:hover:bg-dk-info/30 [&[href]]:focus:bg-dk-info/30',
            tone: 'soft',
            ui: 'dashkit',
            variant: 'info',
        },
        {
            class: 'bg-dk-warning-on-dark/20 text-dk-warning-on-dark [&[href]]:hover:bg-dk-warning-on-dark/30 [&[href]]:focus:bg-dk-warning-on-dark/30',
            tone: 'soft',
            ui: 'dashkit',
            variant: 'warning',
        },
        // `destructive` (TW-flavored) and `danger` (Bootstrap-flavored) both resolve to the danger-soft palette in dashkit mode.
        {
            class: 'bg-dk-danger/20 text-dk-danger [&[href]]:hover:bg-dk-danger/30 [&[href]]:focus:bg-dk-danger/30',
            tone: 'soft',
            ui: 'dashkit',
            variant: 'destructive',
        },
        {
            class: 'bg-dk-danger/20 text-dk-danger [&[href]]:hover:bg-dk-danger/30 [&[href]]:focus:bg-dk-danger/30',
            tone: 'soft',
            ui: 'dashkit',
            variant: 'danger',
        },
        {
            class: 'bg-dk-gray-700/20 text-dk-gray-700 [&[href]]:hover:bg-dk-gray-700/30 [&[href]]:focus:bg-dk-gray-700/30',
            tone: 'soft',
            ui: 'dashkit',
            variant: 'secondary',
        },
        {
            class: 'bg-dk-gray-600/20 text-dk-gray-600 [&[href]]:hover:bg-dk-gray-600/30 [&[href]]:focus:bg-dk-gray-600/30',
            tone: 'soft',
            ui: 'dashkit',
            variant: 'gray',
        },
        {
            class: 'bg-dk-gray-900/55 text-dk-gray-900 [&[href]]:hover:bg-dk-gray-900/70 [&[href]]:focus:bg-dk-gray-900/70',
            tone: 'soft',
            ui: 'dashkit',
            variant: 'dark',
        },
        { class: 'bg-dk-success-on-dark text-dk-black', tone: 'solid', ui: 'dashkit', variant: 'success' },
        { class: 'bg-dk-info text-white', tone: 'solid', ui: 'dashkit', variant: 'info' },
        { class: 'bg-dk-warning-on-dark text-white', tone: 'solid', ui: 'dashkit', variant: 'warning' },
        { class: 'bg-dk-danger text-white', tone: 'solid', ui: 'dashkit', variant: 'destructive' },
        { class: 'bg-dk-danger text-white', tone: 'solid', ui: 'dashkit', variant: 'danger' },
        { class: 'bg-dk-gray-700 text-white', tone: 'solid', ui: 'dashkit', variant: 'secondary' },
        { class: 'bg-dk-gray-900 text-white', tone: 'solid', ui: 'dashkit', variant: 'dark' },
        // Pill must follow base so `px-[0.6em]` wins over the umbrella `px-2`.
        { class: 'rounded-[50rem] px-[0.6em]', pill: true, ui: 'dashkit' },
    ],
    // cva default tone is `original` (the tw default, and what bare `badgeVariants(...)` callers
    // get). The dashkit lineage's historical `soft` default is applied in the Badge component
    // below, which resolves tone per-`ui` before handing it to cva.
    defaultVariants: {
        as: 'badge',
        pill: false,
        size: 'xs',
        status: 'inactive',
        tone: 'original',
        ui: 'tw',
        variant: 'default',
    },
    variants: {
        as: { badge: '', link: '' },
        pill: { false: '', true: '' },
        size: { lg: '', md: '', sm: '', xs: '' },
        status: { active: '', inactive: '' },
        tone: { original: '', soft: '', solid: '' },
        ui: { dashkit: '', tw: '' },
        variant: {
            danger: '',
            dark: '',
            default: '',
            destructive: '',
            gray: '',
            info: '',
            secondary: '',
            success: '',
            transparent: '',
            warning: '',
        },
    },
});

function Badge({
    className,
    as,
    pill,
    size,
    status,
    tone,
    ui,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'span';

    // Per-lineage tone default: the tw badge is "original" unless asked for "soft"; the dashkit
    // badge stays "soft" (its historical default). Solid remains opt-in for both.
    const resolvedUi = ui ?? 'tw';
    const resolvedTone = tone ?? (resolvedUi === 'dashkit' ? 'soft' : 'original');

    return (
        <Comp
            data-slot="badge"
            data-variant={variant ?? 'default'}
            className={cn(
                badgeVariants({ as, pill, size, status, tone: resolvedTone, ui: resolvedUi, variant }),
                className,
            )}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
