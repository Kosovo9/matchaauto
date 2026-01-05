export const breakpoints = {
    xs: 375,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    '3xl': 1920,
}

export const device = {
    mobile: `(max-width: ${breakpoints.md - 1}px)`,
    tablet: `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
    laptop: `(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints['2xl'] - 1}px)`,
    desktop: `(min-width: ${breakpoints['2xl']}px)`,
}

export const getResponsiveValue = (values: {
    mobile?: any
    tablet?: any
    laptop?: any
    desktop?: any
    default: any
}) => {
    if (typeof window === 'undefined') return values.default

    if (window.innerWidth < breakpoints.md && values.mobile !== undefined) {
        return values.mobile
    } else if (window.innerWidth < breakpoints.lg && values.tablet !== undefined) {
        return values.tablet
    } else if (window.innerWidth < breakpoints['2xl'] && values.laptop !== undefined) {
        return values.laptop
    } else if (values.desktop !== undefined) {
        return values.desktop
    }

    return values.default
}
