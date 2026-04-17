import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'mail.infomaniak.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

// Templates d'emails
export const emailTemplates = {
  // Confirmation d'inscription (en attente de validation)
  inscriptionPending: (firstName: string, role: string) => ({
    subject: 'Inscription recue - ASARA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2D8C3C; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ASARA</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Bienvenue ${firstName} !</h2>
          <p>Nous avons bien recu votre demande d'inscription en tant que <strong>${role === 'PROFESSIONAL' ? 'Professionnel' : 'Membre'}</strong>.</p>
          <p>Votre inscription est en cours de validation par notre equipe. Vous recevrez un email de confirmation une fois votre compte active.</p>
          <p>Si vous avez des questions, n'hesitez pas a nous contacter.</p>
          <br>
          <p>Cordialement,</p>
          <p><strong>L'equipe ASARA</strong></p>
        </div>
        <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p>Annuaire des Syriens de France</p>
          <p>Rue Leon Blum, 69150 Decines</p>
        </div>
      </div>
    `,
  }),

  // Compte validé par l'admin
  accountActivated: (firstName: string, role: string) => ({
    subject: 'Compte active - ASARA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2D8C3C; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ASARA</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Felicitations ${firstName} !</h2>
          <p>Votre compte <strong>${role === 'PROFESSIONAL' ? 'Professionnel' : 'Membre'}</strong> a ete active avec succes.</p>
          ${role === 'PROFESSIONAL' ? '<p>Votre profil est maintenant visible dans notre annuaire des professionnels.</p>' : ''}
          <p>Vous pouvez desormais vous connecter et acceder a votre espace membre.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/connexion" style="background: #2D8C3C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Se connecter</a>
          </div>
          <p>Cordialement,</p>
          <p><strong>L'equipe ASARA</strong></p>
        </div>
        <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p>Annuaire des Syriens de France</p>
          <p>Rue Leon Blum, 69150 Decines</p>
        </div>
      </div>
    `,
  }),

  // Compte suspendu
  accountSuspended: (firstName: string) => ({
    subject: 'Compte suspendu - ASARA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2D8C3C; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ASARA</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Bonjour ${firstName},</h2>
          <p>Votre compte a ete suspendu.</p>
          <p>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.</p>
          <p>Cordialement,</p>
          <p><strong>L'equipe ASARA</strong></p>
        </div>
        <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p>Annuaire des Syriens de France</p>
        </div>
      </div>
    `,
  }),

  // Rappel renouvellement 30 jours
  renewalReminder30: (firstName: string, expirationDate: string, amount: string) => ({
    subject: 'Votre adhesion expire dans 30 jours - ASARA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2D8C3C; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ASARA</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Bonjour ${firstName},</h2>
          <p>Votre adhesion ASARA expire le <strong>${expirationDate}</strong>.</p>
          <p>Pour continuer a beneficier de tous nos services, pensez a renouveler votre adhesion (${amount}).</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-compte" style="background: #2D8C3C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Renouveler mon adhesion</a>
          </div>
          <p>Cordialement,</p>
          <p><strong>L'equipe ASARA</strong></p>
        </div>
        <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p>Annuaire des Syriens de France</p>
        </div>
      </div>
    `,
  }),

  // Rappel renouvellement 7 jours
  renewalReminder7: (firstName: string, expirationDate: string, amount: string) => ({
    subject: 'Urgent : Votre adhesion expire dans 7 jours - ASARA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #CE2027; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ASARA</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Bonjour ${firstName},</h2>
          <p style="color: #CE2027;"><strong>Votre adhesion expire dans 7 jours !</strong></p>
          <p>Date d'expiration : <strong>${expirationDate}</strong></p>
          <p>Renouvelez maintenant pour eviter toute interruption de service (${amount}).</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-compte" style="background: #CE2027; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Renouveler maintenant</a>
          </div>
          <p>Cordialement,</p>
          <p><strong>L'equipe ASARA</strong></p>
        </div>
        <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p>Annuaire des Syriens de France</p>
        </div>
      </div>
    `,
  }),

  // Adhesion expiree
  subscriptionExpired: (firstName: string, role: string) => ({
    subject: 'Votre adhesion a expire - ASARA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #CE2027; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ASARA</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Bonjour ${firstName},</h2>
          <p>Votre adhesion ASARA a expire.</p>
          ${role === 'PROFESSIONAL' ? '<p>Votre profil n\'est plus visible dans l\'annuaire.</p>' : ''}
          <p>Renouvelez des maintenant pour retrouver l'acces a tous nos services.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/adhesion" style="background: #2D8C3C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Renouveler mon adhesion</a>
          </div>
          <p>Cordialement,</p>
          <p><strong>L'equipe ASARA</strong></p>
        </div>
        <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p>Annuaire des Syriens de France</p>
        </div>
      </div>
    `,
  }),
};

export default sendEmail;