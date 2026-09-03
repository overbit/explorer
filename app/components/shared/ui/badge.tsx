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
                'px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0',
                '[&_svg]:size-3 gap-1 [&_svg]:pointer-events-none',
            ),
            ui: 'tw',
        },
        { as: 'badge', class: 'rounded', ui: 'tw' },
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
        {
            class: 'border-transparent text-neutral-200 [&_a]:text-neutral-200 [&_a]:hover:text-neutral-100',
            ui: 'tw',
            variant: 'default',
        },
        { class: 'border-transparent bg-destructive text-white', ui: 'tw', variant: 'destructive' },
        { class: 'border-transparent bg-teal-900 text-teal-400', ui: 'tw', variant: 'info' },
        { class: 'border-transparent bg-neutral-400 text-neutral-800', ui: 'tw', variant: 'secondary' },
        { class: 'border-transparent text-green-400 bg-green-900', ui: 'tw', variant: 'success' },
        {
            class: 'border-transparent bg-transparent text-neutral-200 [&_a]:text-neutral-200 [&_a]:hover:text-neutral-100',
            ui: 'tw',
            variant: 'transparent',
        },
        { class: 'border-transparent bg-orange-950 text-orange-400', ui: 'tw', variant: 'warning' },

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
    defaultVariants: {
        as: 'badge',
        font: 'sans',
        pill: false,
        size: 'xs',
        status: 'inactive',
        tone: 'soft',
        ui: 'tw',
        variant: 'default',
    },
    variants: {
        as: { badge: '', link: '' },
        font: { mono: 'font-mono', sans: '' },
        pill: { false: '', true: '' },
        size: { lg: '', md: '', sm: '', xs: '' },
        status: { active: '', inactive: '' },
        tone: { soft: '', solid: '' },
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
    font,
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

    return (
        <Comp
            data-slot="badge"
            data-variant={variant ?? 'default'}
            className={cn(badgeVariants({ as, font, pill, size, status, tone, ui, variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
