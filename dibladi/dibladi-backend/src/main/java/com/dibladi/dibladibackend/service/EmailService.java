package com.dibladi.dibladibackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service d'envoi d'emails transactionnels DiblaDi.
 * Les envois sont @Async pour ne pas bloquer la réponse HTTP de l'admin.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // -------------------------------------------------------------------------
    // Approbation vendeur — envoi des identifiants de connexion
    // -------------------------------------------------------------------------

    /**
     * Envoie un email d'approbation au vendeur après validation de sa demande.
     *
     * @param to        email du vendeur
     * @param firstName prénom du vendeur
     */
    @Async
    public void sendVendorApprovalEmail(String to, String firstName) {
        String subject = "🎉 Bienvenue sur DiblaDi — Votre compte vendeur est activé !";
        String html = buildApprovalHtml(firstName, to);
        sendHtmlEmail(to, subject, html);
    }

    // -------------------------------------------------------------------------
    // Refus vendeur — notification simple et respectueuse
    // -------------------------------------------------------------------------

    /**
     * Envoie un email de refus au vendeur.
     *
     * @param to        email du vendeur
     * @param firstName prénom du vendeur
     */
    @Async
    public void sendVendorRejectionEmail(String to, String firstName) {
        String subject = "Votre demande sur DiblaDi — Mise à jour";
        String html = buildRejectionHtml(firstName);
        sendHtmlEmail(to, subject, html);
    }

    // -------------------------------------------------------------------------
    // Helpers internes
    // -------------------------------------------------------------------------

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("[EmailService] Email envoyé à {} — sujet : {}", to, subject);
        } catch (MessagingException e) {
            // On log l'erreur mais on ne bloque pas le flux métier
            log.error("[EmailService] Échec d'envoi à {} : {}", to, e.getMessage());
        }
    }

    private String buildApprovalHtml(String firstName, String email) {
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8"/>
              <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                .container { max-width: 580px; margin: 30px auto; background: #ffffff;
                             border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
                .header { background: linear-gradient(135deg, #2D6A4F, #52B788);
                          padding: 36px 30px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
                .header p  { color: #d8f3dc; margin: 8px 0 0; font-size: 14px; }
                .body   { padding: 32px 30px; color: #333; }
                .body h2 { color: #2D6A4F; font-size: 18px; margin-top: 0; }
                .credentials { background: #f0fdf4; border-left: 4px solid #52B788;
                               border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
                .credentials p { margin: 6px 0; font-size: 14px; }
                .credentials strong { color: #1b4332; }
                .cta { display: inline-block; background: #52B788; color: #ffffff !important;
                       padding: 12px 28px; border-radius: 6px; text-decoration: none;
                       font-weight: bold; font-size: 15px; margin: 20px 0; }
                .warning { font-size: 12px; color: #888; margin-top: 24px; }
                .footer { background: #f9f9f9; padding: 16px 30px; text-align: center;
                          font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Bienvenue sur DiblaDi !</h1>
                  <p>La marketplace du made-in-Morocco</p>
                </div>
                <div class="body">
                  <h2>Bonjour %s,</h2>
                  <p>Nous avons le plaisir de vous informer que votre demande d'inscription en tant que vendeur sur <strong>DiblaDi</strong> a été <strong>approuvée</strong> !</p>
                  <p>Votre compte est maintenant actif. Vous pouvez vous connecter avec votre email et le mot de passe choisi lors de votre inscription.</p>
                  <div class="credentials">
                    <p>📧 <strong>Email :</strong> %s</p>
                  </div>
                  <a href="%s/login" class="cta">Se connecter à mon espace vendeur</a>
                  <p>Nous vous recommandons de changer votre mot de passe via votre espace vendeur si nécessaire.</p>
                  <p class="warning">⚠️ Si vous n'êtes pas à l'origine de cette demande, ignorez cet email et contactez notre support.</p>
                </div>
                <div class="footer">
                  &copy; 2026 DiblaDi — La marketplace du made-in-Morocco<br/>
                  Cet email est automatique, merci de ne pas y répondre.
                </div>
              </div>
            </body>
            </html>
            """.formatted(firstName, email, frontendUrl);
    }

    private String buildRejectionHtml(String firstName) {
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8"/>
              <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                .container { max-width: 580px; margin: 30px auto; background: #ffffff;
                             border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
                .header { background: linear-gradient(135deg, #4a4a4a, #777);
                          padding: 36px 30px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
                .body { padding: 32px 30px; color: #333; }
                .body h2 { color: #444; font-size: 18px; margin-top: 0; }
                .footer { background: #f9f9f9; padding: 16px 30px; text-align: center;
                          font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Votre demande DiblaDi</h1>
                </div>
                <div class="body">
                  <h2>Bonjour %s,</h2>
                  <p>Nous vous remercions d'avoir manifesté votre intérêt pour rejoindre la communauté DiblaDi.</p>
                  <p>Après examen de votre dossier, nous sommes dans l'impossibilité de donner suite à votre demande d'inscription en tant que vendeur pour le moment.</p>
                  <p>Nous vous souhaitons bonne continuation et restons à votre disposition si vous avez des questions via notre support.</p>
                  <p>Cordialement,<br/><strong>L'équipe DiblaDi</strong></p>
                </div>
                <div class="footer">
                  &copy; 2026 DiblaDi — La marketplace du made-in-Morocco<br/>
                  Cet email est automatique, merci de ne pas y répondre.
                </div>
              </div>
            </body>
            </html>
            """.formatted(firstName);
    }
}
