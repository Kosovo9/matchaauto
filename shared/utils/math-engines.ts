/**
 * 🧮 MOTORES DE CÁLCULO TITAN 1000x
 */

export class MathEngines {
    /**
     * CALCULADORA DE PERMUTA (Barter)
     */
    public static calculateBarterMatch(offeredValue: number, targetValue: number): {
        difference: number,
        direction: 'PAY_OUT' | 'RECEIVE' | 'EVEN',
        message: string
    } {
        const diff = targetValue - offeredValue;
        return {
            difference: Math.abs(diff),
            direction: diff > 0 ? 'PAY_OUT' : diff < 0 ? 'RECEIVE' : 'EVEN',
            message: diff > 0
                ? `Debes pagar una diferencia de ${diff}`
                : `Debes recibir una diferencia de ${Math.abs(diff)}`
        };
    }

    /**
     * ESTIMADOR DE CRÉDITO LOCAL (25 idiomas logic)
     */
    public static estimateMonthlyPayment(totalPrice: number, rate: number = 0.12, months: number = 48): number {
        const monthlyRate = rate / 12;
        return (totalPrice * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    }
}
