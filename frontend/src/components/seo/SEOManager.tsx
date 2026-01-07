import React from 'react';

interface SEOProps {
    title: string;
    description: string;
    path: string;
    domain: 'com' | 'ad';
}

export const SEOManager: React.FC<SEOProps> = ({ title, description, path, domain }) => {
    const fullUrl = `https://match-autos.${domain}${path}`;

    return (
        <>
            <title>{`${title} | Match-Autos 1000x`}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />

            {/* JSON-LD para Buscadores con IA (AIO) */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": title,
                    "description": description,
                    "url": fullUrl,
                    "breadcrumb": {
                        "@type": "BreadcrumbList",
                        "itemListElement": path.split('/').filter(p => p).map((p, i) => ({
                            "@type": "ListItem",
                            "position": i + 1,
                            "name": p.charAt(0).toUpperCase() + p.slice(1),
                            "item": `https://match-autos.${domain}/${path.split('/').slice(0, i + 2).join('/')}`
                        }))
                    }
                })}
            </script>
        </>
    );
};
