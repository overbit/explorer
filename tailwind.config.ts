import type { Config } from 'tailwindcss';

const breakpoints = new Map([
    ['xxs', 320],
    ['xs', 375],
    ['sm', 576],
    ['md', 768],
    ['lg', 992],
    ['xl', 1200],
    ['xxl', 1400],
]);

const config: Config = {
    content: ['./app/**/*.{ts,tsx}'],
    plugins: [],
    prefix: 'e-',
    theme: {
        extend: {
            boxShadow: {
                // border for active states from Dashkit
                active: '0 0 0 0.15rem #33a382',
                'active-sm': '0 0 0 1px #33a382',
            },
            colors: {
                // Gainsway brand - minimal black/white with orange accent
                muted: 'oklch(0.5 0 0)', // #808080 neutral gray
                neutral: {
                    DEFAULT: 'oklch(50% 0 0)',
                    50: 'oklch(98% 0 0)',
                    100: 'oklch(96% 0 0)',
                    200: 'oklch(90% 0 0)',
                    300: 'oklch(83% 0 0)',
                    400: 'oklch(70% 0 0)',
                    500: 'oklch(50% 0 0)',
                    600: 'oklch(40% 0 0)',
                    700: 'oklch(30% 0 0)',
                    800: 'oklch(20% 0 0)',
                    900: 'oklch(10% 0 0)',
                    950: 'oklch(5% 0 0)',
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
