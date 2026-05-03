module.exports = {
    content: ["./pages/*.{html,js}", "./index.html", "./js/*.js"],
    theme: {
        extend: {
            colors: {
                // Primary Colors - Ethiopian Flag Red
                primary: {
                    DEFAULT: "#C8102E", // Ethiopian flag red
                    50: "#FEF2F2", // red-50
                    100: "#FEE2E2", // red-100
                    500: "#C8102E", // Ethiopian flag red
                    600: "#A00E26", // red-600
                    700: "#7F0B1E", // red-700
                    900: "#4A0611", // red-900
                },
                // Secondary Colors - Ethiopian Flag Yellow
                secondary: {
                    DEFAULT: "#FCDD09", // Ethiopian flag yellow
                    50: "#FEFCE8", // yellow-50
                    100: "#FEF3C7", // yellow-100
                    500: "#FCDD09", // Ethiopian flag yellow
                    600: "#D69E2E", // yellow-600
                    700: "#B7791F", // yellow-700
                },
                // Accent Colors - Ethiopian Flag Green
                accent: {
                    DEFAULT: "#078930", // Ethiopian flag green
                    50: "#F0FDF4", // green-50
                    100: "#DCFCE7", // green-100
                    500: "#078930", // Ethiopian flag green
                    600: "#16A34A", // green-600
                    700: "#15803D", // green-700
                },
                // Background Colors
                background: "#FEFEFE", // warm white
                surface: "#F8F6F3", // subtle warm gray
                // Text Colors
                text: {
                    primary: "#2C1810", // rich dark brown
                    secondary: "#6B5B4F", // medium brown
                },
                // Status Colors
                success: {
                    DEFAULT: "#16A34A", // vibrant green
                    50: "#F0FDF4", // green-50
                    100: "#DCFCE7", // green-100
                },
                warning: {
                    DEFAULT: "#EA580C", // warm orange
                    50: "#FFF7ED", // orange-50
                    100: "#FFEDD5", // orange-100
                },
                error: {
                    DEFAULT: "#DC2626", // clear red
                    50: "#FEF2F2", // red-50
                    100: "#FEE2E2", // red-100
                },
            },
            fontFamily: {
                // Headings
                sans: ['Inter', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
                // Body Text
                body: ['Source Sans 3', 'sans-serif'],
                source: ['Source Sans 3', 'sans-serif'],
                // Captions
                caption: ['Roboto', 'sans-serif'],
                roboto: ['Roboto', 'sans-serif'],
                // Data/Numbers
                mono: ['JetBrains Mono', 'monospace'],
                data: ['JetBrains Mono', 'monospace'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
            },
            boxShadow: {
                'card': '0 1px 3px rgba(44, 24, 16, 0.1)',
                'modal': '0 4px 12px rgba(44, 24, 16, 0.15)',
                'hover': '0 4px 12px rgba(44, 24, 16, 0.15)',
            },
            borderRadius: {
                'lg': '8px',
                'xl': '12px',
                '2xl': '16px',
            },
            borderColor: {
                'ethiopian': 'rgba(107, 91, 79, 0.2)',
                'ethiopian-medium': 'rgba(107, 91, 79, 0.3)',
            },
            transitionDuration: {
                '200': '200ms',
                '300': '300ms',
            },
            transitionTimingFunction: {
                'smooth': 'ease-out',
                'layout': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            animation: {
                'fade-in': 'fadeIn 200ms ease-out',
                'slide-up': 'slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
        },
    },
    plugins: [],
}