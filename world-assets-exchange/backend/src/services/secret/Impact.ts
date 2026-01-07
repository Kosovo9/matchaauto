export const ImpactMultiplier = {
    checkEvent: () => {
        const isWeekend = [0, 6].includes(new Date().getDay());
        return {
            active: isWeekend,
            multiplier: isWeekend ? 2 : 1,
            message: isWeekend ? "¡Fin de semana de Impacto Doble! Donamos el 6%." : "Impacto Estándar 3%."
        };
    }
}
