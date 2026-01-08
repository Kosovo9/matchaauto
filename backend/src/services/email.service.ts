import nodemailer from 'nodemailer';

export type EmailSendArgs = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
};

export class EmailService {
    private transporter;

    constructor() {
        const host = process.env.SMTP_HOST || '127.0.0.1';
        const port = Number(process.env.SMTP_PORT || '1025');

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: false,
            auth: undefined, // Mailpit no auth required in local
        });
    }

    async send(args: EmailSendArgs) {
        const from = process.env.EMAIL_FROM || 'Match Autos <no-reply@match-autos.com>';
        return this.transporter.sendMail({
            from,
            to: args.to,
            subject: args.subject,
            text: args.text,
            html: args.html,
        });
    }
}
