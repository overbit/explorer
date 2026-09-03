import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import tailwindcssAnimate from 'tailwindcss-animate';

export const breakpoints = new Map([
    ['xxs', 320],
    ['xs', 375],
    ['sm', 576],
    ['md', 768],
    ['lg', 992],
    ['xl', 1200],
    ['xxl', 1400],
]);

// dashkit migration tokens — sourced from app/scss/dashkit/_variables.scss after _solana-variables.scss overrides.
// Phase 2 replaces Bootstrap classes with `e-*-dk-*` utilities; Phase 3 deletes these once dashkit is gone.
//
// IMPORTANT: explorer renders dark-only today. Entries tagged `// light` below are unused at runtime —
// they're kept here so the migration mirrors the SCSS variable names 1:1 and stays easy to audit.
// When a real light theme lands, rename these to their light-theme equivalents (e.g. `gray-100` →
// `light-gray-100` or move under a `light` namespace) and drop this note.
const dkSpacer = '1.5rem';
export const dkColors = {
    white: '#ffffff',
    black: '#000000',
    'black-dark': '#000000',
    'gray-100': '#f5f5f5', // light — unused at runtime; rename when light theme lands
    'gray-200': '#e5e5e5', // light — unused at runtime
    'gray-300': '#d4d4d4', // light — unused at runtime
    'gray-400': '#a3a3a3', // light — unused at runtime
    'gray-500': '#737373', // light — unused at runtime
    'gray-600': '#808080', // shared light+dark
    'gray-700': '#404040', // light — unused at runtime
    'gray-800': '#262626', // light — unused at runtime
    'gray-900': '#171717', // light — unused at runtime
    'gray-600-dark': '#1a1a1a',
    'gray-700-dark': '#111111',
    'gray-800-dark': '#0a0a0a',
    'gray-900-dark': '#132a46', // used for $table-striped-bg, $pagination-hover-bg, $list-group-hover-bg, $lighter
    primary: '#c9ff00', // light — unused at runtime; dark uses `primary-on-dark`
    'primary-dark': '#a8d600', // active/link color (both themes)
    'primary-on-dark': '#c9ff00',
    success: '#c9ff00', // light — unused at runtime; dark uses `success-on-dark`
    'success-on-dark': '#c9ff00',
    info: '#3b82f6', // shared light+dark
    warning: '#f7931a', // light — unused at runtime; dark uses `warning-on-dark`
    'warning-on-dark': '#fe2626',
    danger: '#dc2626', // shared light+dark
    'rainbow-1': '#fa62fc',
    'rainbow-2': '#be84e8',
    'rainbow-3': '#79abd2',
    'rainbow-4': '#38d0bd',
    'rainbow-5': '#1dd79b',
    'popover-bg': '#1A1A1A',
    'popover-border': 'rgba(255,255,255,0.1)',
    'card-outline-dark': '#0d0d0d',
    'input-placeholder-dark': '#999999',
};

const config: Config = {
    content: ['./app/**/*.{ts,tsx}'],
    plugins: [
        tailwindcssAnimate,
        plugin(({ addUtilities }) => {
            addUtilities({
                '.scrollbar-hide': {
                    'scrollbar-width': 'none',
                    '-ms-overflow-style': 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                },
            });
        }),
    ],
    theme: {
        extend: {
            boxShadow: {
                // border for active states from Dashkit
                active: '0 0 0 0.15rem #a8d600',
                'active-sm': '0 0 0 1px #a8d600',
                'dk-card': '0 0.75rem 1.5rem rgba(0, 0, 0, 0.5)',
                'dk-lift': '0 1rem 2.5rem rgba(0, 0, 0, 0.1), 0 0.5rem 1rem -0.75rem rgba(0, 0, 0, 0.1)',
            },
            borderRadius: {
                'dk-xs': '0.1875rem',
                'dk-sm': '0.25rem',
                dk: '0.375rem',
                'dk-lg': '0.5rem',
                'dk-pill': '200px',
            },
            fontSize: {
                'dk-xs': '0.625rem',
                'dk-sm': '0.8125rem',
                'dk-base': '0.9375rem',
                'dk-lg': '1.0625rem',
                'dk-h1': '1.625rem',
                'dk-h2': '1.25rem',
                'dk-h3': '1.0625rem',
                'dk-h4': '0.9375rem',
                'dk-h5': '0.8125rem',
                'dk-h6': '0.625rem',
            },
            spacing: {
                'dk-1': '0.1875rem',
                'dk-2': '0.375rem',
                'dk-3': '0.75rem',
                'dk-4': dkSpacer,
                'dk-5': '2.25rem',
                'dk-6': '4.5rem',
                'dk-7': '6.75rem',
                'dk-8': '13.5rem',
            },
            colors: {
                dk: dkColors,
                // TODO: replace hex with OKLCH.
                dark: {
                    accent: '#c9ff00',
                    background: '#000000',
                    border: '#1a1a1a',
                    foreground: '#d4d4d4',
                    'muted-foreground': '#404040',
                },
                // TODO: replace with text-neutral-400
                muted: 'oklch(0.5 0 0)',
                'heavy-metal': {
                    DEFAULT: '#171717',
                    50: '#f5f5f5',
                    100: '#e5e5e5',
                    200: '#d4d4d4',
                    300: '#a3a3a3',
                    400: '#737373',
                    500: '#525252',
                    600: '#404040',
                    700: '#262626',
                    800: '#171717',
                    900: '#0a0a0a',
                    950: '#000000',
                },
                'outer-space': {
                    DEFAULT: '#171717',
                    50: '#f5f5f5',
                    100: '#e5e5e5',
                    200: '#d4d4d4',
                    300: '#a3a3a3',
                    400: '#737373',
                    500: '#525252',
                    600: '#404040',
                    700: '#262626',
                    800: '#1a1a1a',
                    900: '#0a0a0a',
                    950: '#000000',
                },
                orange: {
                    DEFAULT: 'oklch(68% 0.19 45)',
                    50: 'oklch(97% 0.03 45)',
                    100: 'oklch(94% 0.06 45)',
                    200: 'oklch(88% 0.10 45)',
                    300: 'oklch(82% 0.14 45)',
                    400: 'oklch(75% 0.17 45)',
                    500: 'oklch(68% 0.19 45)',
                    600: 'oklch(58% 0.18 45)',
                    700: 'oklch(48% 0.15 45)',
                    800: 'oklch(38% 0.12 45)',
                    900: 'oklch(28% 0.08 45)',
                    950: 'oklch(20% 0.05 45)',
                },
                success: {
                    DEFAULT: 'oklch(68% 0.19 45)',
                    50: 'oklch(97% 0.03 45)',
                    100: 'oklch(94% 0.06 45)',
                    200: 'oklch(88% 0.10 45)',
                    300: 'oklch(82% 0.14 45)',
                    400: 'oklch(75% 0.17 45)',
                    500: 'oklch(68% 0.19 45)',
                    600: 'oklch(58% 0.18 45)',
                    700: 'oklch(48% 0.15 45)',
                    800: 'oklch(38% 0.12 45)',
                    900: 'oklch(28% 0.08 45)',
                    950: 'oklch(20% 0.05 45)',
                },
                accent: {
                    DEFAULT: 'oklch(68% 0.19 45)',
                    50: 'oklch(97% 0.03 45)',
                    100: 'oklch(94% 0.06 45)',
                    200: 'oklch(88% 0.10 45)',
                    300: 'oklch(82% 0.14 45)',
                    400: 'oklch(75% 0.17 45)',
                    500: 'oklch(68% 0.19 45)',
                    600: 'oklch(58% 0.18 45)',
                    700: 'oklch(48% 0.15 45)',
                    800: 'oklch(38% 0.12 45)',
                    900: 'oklch(28% 0.08 45)',
                    950: 'oklch(20% 0.05 45)',
                },
                destructive: {
                    DEFAULT: 'oklch(62% 0.22 25)',
                    50: 'oklch(98% 0.02 25)',
                    100: 'oklch(96% 0.04 25)',
                    200: 'oklch(92% 0.08 25)',
                    300: 'oklch(86% 0.13 25)',
                    400: 'oklch(76% 0.18 25)',
                    500: 'oklch(62% 0.22 25)',
                    600: 'oklch(52% 0.21 25)',
                    700: 'oklch(42% 0.18 25)',
                    800: 'oklch(34% 0.15 25)',
                    900: 'oklch(26% 0.11 25)',
                    950: 'oklch(20% 0.08 25)',
                },
            },
            gridTemplateColumns: {
                // Grid template for TokenExtensions
                '12-ext': 'repeat(12, minmax(0, 1fr))',
            },
            keyframes: {
                'dropdown-menu': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
            },
            animation: {
                'dropdown-menu': 'dropdown-menu 0.15s',
            },
        },

        screens: {
            'max-sm': getScreenDim('sm', -1),
            'max-md': getScreenDim('md', -1),
            xxs: getScreenDim('xxs'),
            xs: getScreenDim('xs'),
            sm: getScreenDim('sm'),
            md: getScreenDim('md'),
            lg: getScreenDim('lg'),
            xl: getScreenDim('xl'),
            xxl: getScreenDim('xxl'),
            mobile: getScreenDim('sm'),
            tablet: getScreenDim('md'),
            laptop: getScreenDim('lg'),
            desktop: getScreenDim('xl'),
            landscape: { raw: '(orientation: landscape)' },
        },
    },
};

export default config;

// adjust breakpoint 1px up see previous layout on the "edge"
function getScreenDim(label: string, shift = 1) {
    const a = breakpoints.get(label);
    if (!a) throw new Error(`Unknown breakpoint: ${label}`);
    return `${a + shift}px`;
}
