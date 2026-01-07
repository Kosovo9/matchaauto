export class StealthEngine {
    private static SECRET_SALT = 'match-auto-nebula';

    static encryptSellersNote(note: string, userId: string): string {
        return CryptoJS.AES.encrypt(note, userId + this.SECRET_SALT).toString();
    }

    static decryptSellersNote(encryptedNote: string, userId: string): string {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedNote, userId + this.SECRET_SALT);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch {
            return 'Nota Protegida por StealthMode';
        }
    }
}
