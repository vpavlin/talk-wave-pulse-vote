
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out'
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '65ch',
						color: 'hsl(var(--foreground))',
						'[class~="lead"]': {
							color: 'hsl(var(--foreground))',
						},
						a: {
							color: 'hsl(var(--primary))',
							textDecoration: 'underline',
							fontWeight: '500',
						},
						strong: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
						},
						'ol > li::before': {
							color: 'hsl(var(--foreground))',
							fontWeight: '400',
						},
						'ul > li::before': {
							backgroundColor: 'hsl(var(--muted-foreground))',
						},
						hr: {
							borderColor: 'hsl(var(--border))',
						},
						blockquote: {
							color: 'hsl(var(--foreground))',
							borderLeftColor: 'hsl(var(--border))',
						},
						h1: {
							color: 'hsl(var(--foreground))',
						},
						h2: {
							color: 'hsl(var(--foreground))',
						},
						h3: {
							color: 'hsl(var(--foreground))',
						},
						h4: {
							color: 'hsl(var(--foreground))',
						},
						'figure figcaption': {
							color: 'hsl(var(--muted-foreground))',
						},
						code: {
							color: 'hsl(var(--foreground))',
							fontWeight: '500',
						},
						pre: {
							color: 'hsl(var(--foreground))',
							backgroundColor: 'hsl(var(--muted))',
						},
						thead: {
							color: 'hsl(var(--foreground))',
							borderBottomColor: 'hsl(var(--border))',
						},
						'tbody tr': {
							borderBottomColor: 'hsl(var(--border))',
						},
					},
				},
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
