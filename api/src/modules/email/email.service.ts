import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (!host || !port) {
      this.logger.warn(
        'Email service not configured. Emails will not be sent.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user
        ? {
            user,
            pass,
          }
        : undefined,
    });
  }

  async sendInvitation(
    to: string,
    invitedByName: string,
    invitationToken: string,
    invitedEmail: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `Invitation email to ${to} would be sent but SMTP is not configured`,
      );
      return;
    }

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:4200',
    );
    const acceptLink = `${frontendUrl}/auth/register?token=${invitationToken}&email=${encodeURIComponent(
      invitedEmail,
    )}`;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Você foi convidado para compartilhar dados financeiros!</h2>

            <p>${invitedByName} o(a) convidou para compartilhar os dados da aplicação Personal Expense Tracker.</p>

            <p>Para aceitar este convite, clique no botão abaixo e complete seu cadastro:</p>

            <p>
              <a href="${acceptLink}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Aceitar Convite e Criar Conta
              </a>
            </p>

            <p>Ou copie e cole este link no seu navegador:<br/>
            <code style="background-color: #f4f4f4; padding: 8px; border-radius: 4px; word-break: break-all;">
              ${acceptLink}
            </code>
            </p>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Este convite expirará em 7 dias.
            </p>
          </div>
        </body>
      </html>
    `;

    const from = this.configService.get<string>(
      'SMTP_FROM',
      'noreply@expensetacker.com',
    );

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: 'Convite para compartilhar dados financeiros - Personal Expense Tracker',
        html: htmlContent,
      });

      this.logger.log(`Invitation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${to}:`, error);
      throw error;
    }
  }
}
