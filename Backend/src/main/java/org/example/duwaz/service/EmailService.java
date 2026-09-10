package org.example.duwaz.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${resend.api.key:}")
    private String resendApiKey;

    // ── Registration OTP (via Resend API — works on all hosting platforms) ────
    public void sendRegistrationOtpEmail(String toEmail, String userName, String otpCode) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.err.println("[EmailService] RESEND_API_KEY not configured — cannot send OTP email");
            throw new RuntimeException("Email service not configured. Please contact support.");
        }

        try {
            Resend resend = new Resend(resendApiKey);

            String html = """
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
                      <h2 style="color:#7c3f2a;margin-bottom:4px;">Duwaz</h2>
                      <p style="color:#6b7280;font-size:14px;margin-top:0;">Student Hub Market</p>
                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
                      <p style="font-size:16px;">Hi <strong>%s</strong>,</p>
                      <p style="font-size:15px;color:#374151;">
                        Use the code below to verify your email address and complete your registration.
                        This code expires in <strong>10 minutes</strong>.
                      </p>
                      <div style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:10px;padding:20px;text-align:center;margin:24px 0;">
                        <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;letter-spacing:1px;">VERIFICATION CODE</p>
                        <p style="margin:8px 0 0;font-size:42px;font-weight:900;letter-spacing:10px;color:#7c3f2a;font-family:monospace;">%s</p>
                      </div>
                      <p style="font-size:13px;color:#9ca3af;">
                        If you did not create a Duwaz account, you can safely ignore this email.
                      </p>
                      <p style="font-size:13px;color:#9ca3af;margin-bottom:0;">— The Duwaz Team</p>
                    </div>
                    """.formatted(userName, otpCode);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("Duwaz <onboarding@resend.dev>")
                    .to(toEmail)
                    .subject("Verify your Duwaz account")
                    .html(html)
                    .build();

            CreateEmailResponse response = resend.emails().send(params);
            System.out.println("[EmailService] Registration OTP sent to " + toEmail + " — id: " + response.getId());

        } catch (ResendException e) {
            System.err.println("[EmailService] Resend error for " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Failed to send verification email: " + e.getMessage(), e);
        }
    }

    // ── Delivery OTP (also via Resend) ────────────────────────────────────────
    public void sendOtpEmail(String toEmail, String customerName, String otpCode, Long orderId) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.err.println("[EmailService] RESEND_API_KEY not configured — skipping delivery OTP email");
            return;
        }

        try {
            Resend resend = new Resend(resendApiKey);

            String html = """
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
                      <h2 style="color:#7c3f2a;margin-bottom:4px;">Duwaz</h2>
                      <p style="color:#6b7280;font-size:14px;margin-top:0;">Student Hub Market</p>
                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
                      <p style="font-size:16px;">Hi <strong>%s</strong>,</p>
                      <p style="font-size:15px;color:#374151;">
                        Your order <strong>#%d</strong> is arriving now!
                        Give the code below to your driver to confirm delivery:
                      </p>
                      <div style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:10px;padding:20px;text-align:center;margin:24px 0;">
                        <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;letter-spacing:1px;">DELIVERY OTP</p>
                        <p style="margin:8px 0 0;font-size:42px;font-weight:900;letter-spacing:10px;color:#7c3f2a;font-family:monospace;">%s</p>
                      </div>
                      <p style="font-size:13px;color:#9ca3af;">
                        This code is valid for this delivery only. Do not share it with anyone except your driver.
                      </p>
                      <p style="font-size:13px;color:#9ca3af;margin-bottom:0;">— The Duwaz Team</p>
                    </div>
                    """.formatted(customerName, orderId, otpCode);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("Duwaz <onboarding@resend.dev>")
                    .to(toEmail)
                    .subject("Your Delivery OTP — Order #" + orderId)
                    .html(html)
                    .build();

            resend.emails().send(params);

        } catch (ResendException e) {
            System.err.println("[EmailService] Failed to send delivery OTP to " + toEmail + ": " + e.getMessage());
        }
    }
}
