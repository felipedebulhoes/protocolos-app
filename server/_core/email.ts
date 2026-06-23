import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  name?: string | null,
) {
  try {
    const result = await resend.emails.send({
      from: "noreply@protocolos.felipebulhoes.com",
      to: email,
      subject: "Redefinir sua senha - ProtoUro",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Redefinir Senha</h2>
          <p style="color: #666; line-height: 1.6;">
            Olá ${name || "usuário"},
          </p>
          <p style="color: #666; line-height: 1.6;">
            Você solicitou para redefinir sua senha. Clique no link abaixo para continuar:
          </p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #B87333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            Este link expira em 1 hora. Se você não solicitou isso, ignore este email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">
            ProtoUro - Handbook Digital de Protocolos Urológicos
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error("[Resend Error]", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[Email Send Error]", error);
    return { success: false, error };
  }
}

export async function sendSetupLinkEmail(
  email: string,
  setupUrl: string,
  name?: string | null,
) {
  try {
    const result = await resend.emails.send({
      from: "noreply@protocolos.felipebulhoes.com",
      to: email,
      subject: "Crie sua senha de acesso - ProtoUro",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1C3D5A;">Bem-vindo(a) ao ProtoUro</h2>
          <p style="color: #666; line-height: 1.6;">
            Olá ${name || ""},
          </p>
          <p style="color: #666; line-height: 1.6;">
            Você foi convidado(a) a acessar o ProtoUro — Handbook Digital de Protocolos Urológicos.
            Clique no botão abaixo para criar sua senha de acesso:
          </p>
          <div style="margin: 30px 0;">
            <a href="${setupUrl}" style="background-color: #B87333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Criar minha senha
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            Este link expira em 7 dias. Se você não esperava este convite, ignore este email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">
            ProtoUro - Handbook Digital de Protocolos Urológicos
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error("[Resend Error]", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[Email Send Error]", error);
    return { success: false, error };
  }
}

export async function testResendConnection() {
  try {
    // Try to list emails to verify API key is valid
    const result = await resend.emails.list();
    return { success: !result.error };
  } catch (error) {
    console.error("[Resend Connection Test Error]", error);
    return { success: false };
  }
}
