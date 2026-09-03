// TODO(fsd): relocate this module to @shared or the appropriate feature/entity layer.
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/app/components/shared/utils';

// `ui` picks the visual lineage, mirroring Badge / BaseCard / BaseTable. `dashkit` emits the raw
// Bootstrap `.btn` + `.btn-<variant>` classes the rest of the app currently uses, so migrations
// don't change visuals; the dashkit branch + the dashkit-only variant values get deleted once the
// dashkit SCSS is gone.
const buttonVariants = cva([], {
    compoundVariants: [
        // ===== ui="tw" =====
        {
            class: cn(
                'border-solid',
                'inline-flex items-center justify-center',
                'whitespace-nowrap text-sm font-medium',
                'transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-neutral-950',
                'disabled:pointer-events-none disabled:opacity-50',
                '[&_svg]:pointer-events-none [&_svg]:shrink-0',
            ),
            ui: 'tw',
        },
        // gap/rounding/svg sizing live on the size compounds (not the shared base) so a size
        // can redefine them without fighting stylesheet order — cn() here does not dedupe.
        { class: 'h-6 gap-2 rounded px-2 !text-[11px] !font-normal [&_svg]:size-3', size: 'compact', ui: 'tw' },
        { class: 'h-9 gap-2 rounded px-2 text-xs [&_svg]:size-3', size: 'default', ui: 'tw' },
        { class: 'h-7 w-7 gap-2 rounded [&_svg]:size-3', size: 'icon', ui: 'tw' },
        { class: 'h-10 gap-2 rounded px-8 [&_svg]:size-3', size: 'lg', ui: 'tw' },
        { class: 'h-7 gap-2 rounded px-2 text-xs [&_svg]:size-3', size: 'sm', ui: 'tw' },
        // Tall icon-over-label action tile (e.g. slideover footer actions).
        { class: 'h-16 flex-col gap-1 rounded-lg px-2 text-xs [&_svg]:size-4', size: 'tile', ui: 'tw' },
        { class: 'border-0 bg-accent text-gray-900 hover:bg-accent/90', ui: 'tw', variant: 'accent' },
        {
            class: 'border border-outer-space-800 bg-outer-space-900 text-neutral-200 rounded-sm leading-none tracking-[-0.44px]',
            ui: 'tw',
            variant: 'compact',
        },
        {
            class: 'border border-neutral-700 bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-900/90',
            ui: 'tw',
            variant: 'default',
        },
        {
            // border-0 (here and below): UA buttons carry a 2px border and @tailwind base is skipped
            class: 'border-0 bg-red-500 text-neutral-50 shadow-sm hover:bg-red-500/90',
            ui: 'tw',
            variant: 'destructive',
        },
        {
            class: 'border-0 bg-transparent text-neutral-50 hover:bg-neutral-800 hover:text-neutral-50',
            ui: 'tw',
            variant: 'ghost',
        },
        { class: 'border-0 text-neutral-900 underline-offset-4 hover:underline', ui: 'tw', variant: 'link' },
        {
            class: 'border border-neutral-600 bg-transparent text-white hover:bg-neutral-600/10 hover:text-white focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-neutral-950',
            ui: 'tw',
            variant: 'outline',
        },
        {
            class: 'border-0 bg-neutral-100 text-neutral-900 shadow-sm hover:bg-neutral-100/80',
            ui: 'tw',
            variant: 'secondary',
        },

        // ===== ui="dashkit" =====
        // Defaults that would conflict with per-variant compounds (bg/border) or per-size
        // compounds (padding/text/leading/rounded) are intentionally omitted — cn (clsx) keeps
        // all classes, so source order in the compiled CSS would otherwise
        // let the larger/wider base values beat the size compound.
        {
            // text-white intentionally omitted — variant compounds own text color and cn (clsx)
            // keeps all classes, so a base color would beat the variant's color in CSS source order.
            class: cn(
                'inline-block text-center align-middle cursor-pointer select-none',
                'border border-solid',
                'font-normal',
                'transition-[color,background-color,border-color,box-shadow] duration-150 ease-in-out',
                'disabled:pointer-events-none disabled:opacity-[0.65]',
            ),
            ui: 'dashkit',
        },
        // Size modifiers — each owns padding, font-size, line-height, and radius outright.
        {
            class: 'px-3 py-2 text-[0.9375rem] leading-[1.5] rounded-[0.375rem]',
            size: 'default',
            ui: 'dashkit',
        },
        { class: 'px-2 py-0.5 text-[0.8125rem] leading-[1.75] rounded-[0.25rem]', size: 'sm', ui: 'dashkit' },
        { class: 'px-5 py-3 text-[0.9375rem] leading-[1.5] rounded-[0.5rem]', size: 'lg', ui: 'dashkit' },
        {
            // _solana.scss .btn-primary{color:$gray-900} only beats the idle rule — Bootstrap's :hover/:disabled (class+pseudo) kept white.
            class: 'bg-dk-primary-on-dark border-dk-primary-on-dark text-dk-black hover:bg-[#abd900] hover:border-[#a1cc00] hover:text-dk-black disabled:text-dk-black',
            ui: 'dashkit',
            variant: 'primary',
        },
        {
            class: 'bg-dk-gray-700 border-dk-gray-700 text-white hover:bg-[#333333] hover:border-[#303030]',
            ui: 'dashkit',
            variant: 'secondary',
        },
        {
            class: 'bg-dk-gray-800-dark border-dk-gray-600-dark text-white hover:bg-[#080808] hover:border-[#151515]',
            ui: 'dashkit',
            variant: 'white',
        },
        {
            class: 'bg-dk-black border-dk-black text-white hover:bg-[#0d0d0d] hover:border-[#0d0d0d]',
            ui: 'dashkit',
            variant: 'black',
        },
        {
            class: 'bg-dk-gray-900 border-dk-gray-900 text-white hover:bg-[#141414] hover:border-[#121212]',
            ui: 'dashkit',
            variant: 'dark',
        },
        {
            class: 'bg-transparent border-dk-primary-on-dark text-dk-primary-on-dark hover:bg-dk-primary-on-dark hover:border-dk-primary-on-dark hover:text-dk-black disabled:bg-transparent disabled:text-dk-primary-on-dark',
            ui: 'dashkit',
            variant: 'outline-primary',
        },
        {
            class: 'bg-transparent border-dk-danger text-dk-danger hover:bg-dk-danger hover:border-dk-danger hover:text-white disabled:bg-transparent disabled:text-dk-danger',
            ui: 'dashkit',
            variant: 'outline-danger',
        },
        {
            class: 'bg-transparent border-dk-warning-on-dark text-dk-warning-on-dark hover:bg-dk-warning-on-dark hover:border-dk-warning-on-dark hover:text-white disabled:bg-transparent disabled:text-dk-warning-on-dark',
            ui: 'dashkit',
            variant: 'outline-warning',
        },
        {
            class: 'bg-dk-warning-on-dark border-dk-warning-on-dark text-white hover:bg-[#d62020] hover:border-[#c91e1e]',
            ui: 'dashkit',
            variant: 'warning',
        },
        {
            class: 'bg-dk-danger border-dk-danger text-white hover:bg-[#bb2020] hover:border-[#af1e1e]',
            ui: 'dashkit',
            variant: 'danger',
        },
        // Toggle-on ring; only meaningful when paired with `variant="black"` in `btn-group-toggle`.
        { active: true, class: 'shadow-active', ui: 'dashkit' },
    ],
    defaultVariants: {
        active: false,
        size: 'default',
        ui: 'tw',
        variant: 'default',
    },
    variants: {
        active: { false: '', true: '' },
        size: { compact: '', default: '', icon: '', lg: '', sm: '', tile: '' },
        ui: { dashkit: '', tw: '' },
        variant: {
            accent: '',
            black: '',
            compact: '',
            danger: '',
            dark: '',
            default: '',
            destructive: '',
            ghost: '',
            link: '',
            outline: '',
            'outline-danger': '',
            'outline-primary': '',
            'outline-warning': '',
            primary: '',
            secondary: '',
            warning: '',
            white: '',
        },
    },
});

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, active, size, ui, variant, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return <Comp className={cn(buttonVariants({ active, size, ui, variant }), className)} ref={ref} {...props} />;
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
