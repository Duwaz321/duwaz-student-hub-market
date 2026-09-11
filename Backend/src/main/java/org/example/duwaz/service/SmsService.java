package org.example.duwaz.service;

import com.africastalking.AfricasTalking;
import com.africastalking.SmsService;
import com.africastalking.sms.Recipient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SmsService {

    @Value("${africastalking.username:sandbox}")
    private String username;

    @Value("${africastalking.api.key:}")
    private String apiKey;

    /**
     * Sends a registration OTP via SMS using Africa's Talking.
     * Works in sandbox mode (free) and production mode.
     *
     * Phone number must be in international format, e.g. +27821234567
     */
    public void sendOtpSms(String phoneNumber, String otpCode) {
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("[SmsService] AT_API_KEY not configured");
            throw new RuntimeException("SMS service not configured. Please contact support.");
        }

        try {
            AfricasTalking.initialize(username, apiKey);
            SmsService sms = AfricasTalking.getService(AfricasTalking.SERVICE_SMS);

            String message = "Your Duwaz verification code is: " + otpCode +
                    ". Valid for 10 minutes. Do not share this code.";

            List<Recipient> responses = sms.send(message, new String[]{phoneNumber}, true);
            for (Recipient r : responses) {
                System.out.println("[SmsService] SMS to " + phoneNumber +
                        " → status: " + r.status + ", cost: " + r.cost);
            }
        } catch (Exception e) {
            System.err.println("[SmsService] Failed to send OTP SMS to " + phoneNumber + ": " + e.getMessage());
            throw new RuntimeException("Failed to send verification SMS: " + e.getMessage(), e);
        }
    }
}
