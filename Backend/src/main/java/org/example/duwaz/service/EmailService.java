package org.example.duwaz.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EmailService {

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${app.admin.email:duwaz2026@gmail.com}")
    private String defaultAdminEmail;

    private void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        if (toEmail == null || toEmail.isBlank()) return;
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.err.println("[EmailService] RESEND_API_KEY not configured — skipping email to " + toEmail);
            return;
        }

        try {
            Resend resend = new Resend(resendApiKey);
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("Duwaz <noreply@duwaz.co.za>")
                    .to(toEmail)
                    .subject(subject)
                    .html(htmlBody)
                    .build();

            CreateEmailResponse response = resend.emails().send(params);
            System.out.println("[EmailService] Email sent to " + toEmail + " — id: " + response.getId());
        } catch (ResendException e) {
            System.err.println("[EmailService] Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

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
                    .from("Duwaz <noreply@duwaz.co.za>")
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
                    .from("Duwaz <noreply@duwaz.co.za>")
                    .to(toEmail)
                    .subject("Your Delivery OTP — Order #" + orderId)
                    .html(html)
                    .build();

            resend.emails().send(params);

        } catch (ResendException e) {
            System.err.println("[EmailService] Failed to send delivery OTP to " + toEmail + ": " + e.getMessage());
        }
    }

    public void sendNewOrderEmailToShopOwner(String shopOwnerEmail, String shopName, String customerName, Long orderId, BigDecimal totalAmount) {
        String html = """
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
              <h2 style="color:#7c3f2a;margin-bottom:4px;">Duwaz</h2>
              <p style="color:#6b7280;font-size:14px;margin-top:0;">New order received</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
              <p style="font-size:16px;">Hi <strong>%s</strong>,</p>
              <p style="font-size:15px;color:#374151;">
                You have a new order for <strong>%s</strong> from <strong>%s</strong>.
              </p>
              <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:16px;margin:18px 0;">
                <p style="margin:0;font-size:13px;color:#92400e;font-weight:700;letter-spacing:0.5px;">ORDER DETAILS</p>
                <p style="margin:8px 0 0;font-size:15px;color:#111827;">Order #<strong>%d</strong></p>
                <p style="margin:4px 0 0;font-size:15px;color:#111827;">Total: <strong>R%s</strong></p>
              </div>
              <p style="font-size:13px;color:#6b7280;">Please log in to the shop dashboard to review and accept the order.</p>
              <p style="font-size:13px;color:#9ca3af;margin-bottom:0;">— The Duwaz Team</p>
            </div>
            """.formatted(shopName, shopName, customerName, orderId, totalAmount.toPlainString());

        sendHtmlEmail(shopOwnerEmail, "New order received for " + shopName + " (#" + orderId + ")", html);
    }

    public void sendNewOrderEmailToAdmins(String shopName, String customerName, Long orderId, BigDecimal totalAmount, List<String> adminEmails) {
        Set<String> uniqueEmails = adminEmails.stream()
                .filter(email -> email != null && !email.isBlank())
                .map(String::trim)
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));

        if (uniqueEmails.isEmpty() && defaultAdminEmail != null && !defaultAdminEmail.isBlank()) {
            uniqueEmails.add(defaultAdminEmail.trim());
        }

        String html = """
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
              <h2 style="color:#7c3f2a;margin-bottom:4px;">Duwaz</h2>
              <p style="color:#6b7280;font-size:14px;margin-top:0;">Admin attention required</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
              <p style="font-size:16px;">Hi Admin,</p>
              <p style="font-size:15px;color:#374151;">
                A new order has been placed for <strong>%s</strong> by <strong>%s</strong> and needs review.
              </p>
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin:18px 0;">
                <p style="margin:0;font-size:13px;color:#1d4ed8;font-weight:700;letter-spacing:0.5px;">ORDER DETAILS</p>
                <p style="margin:8px 0 0;font-size:15px;color:#111827;">Order #<strong>%d</strong></p>
                <p style="margin:4px 0 0;font-size:15px;color:#111827;">Total: <strong>R%s</strong></p>
              </div>
              <p style="font-size:13px;color:#6b7280;">Please log in to the admin dashboard to approve or forward the order.</p>
              <p style="font-size:13px;color:#9ca3af;margin-bottom:0;">— The Duwaz Team</p>
            </div>
            """.formatted(shopName, customerName, orderId, totalAmount.toPlainString());

        for (String adminEmail : uniqueEmails) {
            sendHtmlEmail(adminEmail, "New Duwaz order needs admin review (#" + orderId + ")", html);
        }
    }

    public void sendOrderStatusEmailToShopOwner(String shopOwnerEmail, String shopName, String customerName, Long orderId, String status, String reason) {
        String html = """
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
              <h2 style="color:#7c3f2a;margin-bottom:4px;">Duwaz</h2>
              <p style="color:#6b7280;font-size:14px;margin-top:0;">Order status update</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
              <p style="font-size:16px;">Hi <strong>%s</strong>,</p>
              <p style="font-size:15px;color:#374151;">
                Order <strong>#%d</strong> for <strong>%s</strong> has been updated to <strong>%s</strong>.
              </p>
              <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:16px;margin:18px 0;">
                <p style="margin:0;font-size:13px;color:#6d28d9;font-weight:700;letter-spacing:0.5px;">STATUS</p>
                <p style="margin:8px 0 0;font-size:15px;color:#111827;">%s</p>
                %s
              </div>
              <p style="font-size:13px;color:#6b7280;">Please log in to the dashboard for the latest order details.</p>
              <p style="font-size:13px;color:#9ca3af;margin-bottom:0;">— The Duwaz Team</p>
            </div>
            """.formatted(
                shopName,
                orderId,
                customerName,
                status,
                status,
                reason != null && !reason.isBlank() ? "<p style=\"margin:8px 0 0;font-size:14px;color:#374151;\">Reason: <strong>" + reason + "</strong></p>" : ""
            );

        sendHtmlEmail(shopOwnerEmail, "Order #" + orderId + " status update - " + status, html);
    }

    public void sendOrderStatusEmailToAdmins(String customerName, String shopName, Long orderId, String status, String reason, List<String> adminEmails) {
        Set<String> uniqueEmails = adminEmails.stream()
                .filter(email -> email != null && !email.isBlank())
                .map(String::trim)
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));

        if (uniqueEmails.isEmpty() && defaultAdminEmail != null && !defaultAdminEmail.isBlank()) {
            uniqueEmails.add(defaultAdminEmail.trim());
        }

        String html = """
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
              <h2 style="color:#7c3f2a;margin-bottom:4px;">Duwaz</h2>
              <p style="color:#6b7280;font-size:14px;margin-top:0;">Order status update</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
              <p style="font-size:16px;">Hi Admin,</p>
              <p style="font-size:15px;color:#374151;">
                Order <strong>#%d</strong> for <strong>%s</strong> from <strong>%s</strong> is now <strong>%s</strong>.
              </p>
              %s
              <p style="font-size:13px;color:#6b7280;">Please log in to the admin dashboard to continue the workflow.</p>
              <p style="font-size:13px;color:#9ca3af;margin-bottom:0;">— The Duwaz Team</p>
            </div>
            """.formatted(orderId, shopName, customerName, status,
                reason != null && !reason.isBlank() ? "<p style=\"margin:12px 0 0;font-size:14px;color:#374151;\">Reason: <strong>" + reason + "</strong></p>" : "");

        for (String adminEmail : uniqueEmails) {
            sendHtmlEmail(adminEmail, "Order #" + orderId + " updated to " + status, html);
        }
    }
}

