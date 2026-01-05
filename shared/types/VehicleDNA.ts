import CryptoJS from 'crypto-js';

export class VehicleDNA {
    static generateHash(vehicle: any): string {
        const data = `${vehicle.vin || ''}-${vehicle.make}-${vehicle.model}-${vehicle.year}-${vehicle.userId}`;
        return 'dna_' + CryptoJS.SHA256(data).toString().substring(0, 16).toUpperCase();
    }

    static verify(dna: string, vehicle: any): boolean {
        return dna === this.generateHash(vehicle);
    }
}
