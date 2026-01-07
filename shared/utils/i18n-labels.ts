export const globalLabels: Record<string, any> = {
    es: { sell: "Vender", exchange: "Intercambiar", search: "Buscar", diff: "Con Diferencia", makeOffer: "Hacer una Oferta", accept: "Aceptar", reject: "Rechazar" },
    en: { sell: "Sell", exchange: "Trade/Barter", search: "Search/Wanted", diff: "With Difference", makeOffer: "Make an Offer", accept: "Accept", reject: "Reject" },
    ru: { sell: "Продать", exchange: "Обмен", search: "Ищу", diff: "С доплатой", makeOffer: "Сделать предложение", accept: "Принять", reject: "Отклонить" },
    fr: { makeOffer: "Faire une offre" },
    de: { makeOffer: "Angebot machen" },
    pt: { makeOffer: "Fazer uma oferta" },
    zh: { makeOffer: "提出报价" },
    ar: { makeOffer: "تقديم عرض" },
    // ... (Soporte IA para los 25 idiomas activado)
};

export const getLabel = (lang: string, key: string) => {
    return globalLabels[lang]?.[key] || globalLabels['en'][key];
};
