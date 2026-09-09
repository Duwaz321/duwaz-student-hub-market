package org.example.duwaz.service;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory OTP store for email verification during registration.
 *
 * Security properties:
 * - OTP is a 6-digit numeric code generated with SecureRandom.
 * - Only a BCrypt hash is stored — the plaintext is never retained.
 * - Expires after 10 minutes.
 * - Maximum 5 failed verification attempts per email before the entry is invalidated.
 * - Maximum 3 resend requests per email per 10-minute window.
 * - The plaintext OTP is only returned once (to be emailed) and never again.
 */
@Service
public class OtpService {

    private static final int OTP_TTL_SECONDS    = 600;  // 10 minutes
    private static final int MAX_VERIFY_ATTEMPTS = 5;
    private static final int MAX_RESEND_REQUESTS = 3;

    private static class OtpEntry {
        final String  hashedOtp;
        final Instant expiresAt;
        int           failedAttempts = 0;
        int           resendCount    = 0;

        OtpEntry(String hashedOtp) {
            this.hashedOtp = hashedOtp;
            this.expiresAt = Instant.now().plusSeconds(OTP_TTL_SECONDS);
        }

        boolean isExpired()     { return Instant.now().isAfter(expiresAt); }
        boolean isLocked()      { return failedAttempts >= MAX_VERIFY_ATTEMPTS; }
        boolean canResend()     { return resendCount < MAX_RESEND_REQUESTS; }
    }

    // Key = lowercase email
    private final ConcurrentHashMap<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final SecureRandom rng = new SecureRandom();

    /**
     * Generates a new OTP for the email, stores its hash, and returns the
     * plaintext for immediate use (emailing). Never call this again to retrieve it.
     *
     * @throws IllegalStateException if resend limit reached
     */
    public String generateOtp(String email) {
        String key = email.toLowerCase();
        OtpEntry existing = store.get(key);

        if (existing != null && !existing.isExpired()) {
            if (!existing.canResend()) {
                throw new IllegalStateException("Too many OTP requests. Please wait before trying again.");
            }
            existing.resendCount++;
        }

        // Generate 6-digit OTP
        int code = 100_000 + rng.nextInt(900_000);
        String plainOtp = String.valueOf(code);
        String hashed   = BCrypt.hashpw(plainOtp, BCrypt.gensalt(10));

        OtpEntry entry = new OtpEntry(hashed);
        // Preserve resend count across regenerations within the same window
        if (existing != null && !existing.isExpired()) {
            entry.resendCount = existing.resendCount;
        }

        store.put(key, entry);
        return plainOtp;   // caller emails this, then discards it
    }

    /**
     * Verifies the OTP entered by the user.
     *
     * @return true if correct and not expired
     * @throws IllegalStateException for expired, locked, or missing entries
     */
    public boolean verifyOtp(String email, String candidateOtp) {
        String   key   = email.toLowerCase();
        OtpEntry entry = store.get(key);

        if (entry == null)          throw new IllegalStateException("No OTP found. Please request a new one.");
        if (entry.isExpired())      { store.remove(key); throw new IllegalStateException("OTP has expired. Please request a new one."); }
        if (entry.isLocked())       throw new IllegalStateException("Too many incorrect attempts. Please request a new OTP.");

        boolean match = BCrypt.checkpw(candidateOtp, entry.hashedOtp);
        if (!match) {
            entry.failedAttempts++;
            return false;
        }

        store.remove(key);  // consume — single use
        return true;
    }

    /** How many seconds remain before the current OTP expires (0 if none/expired). */
    public long secondsRemaining(String email) {
        OtpEntry entry = store.get(email.toLowerCase());
        if (entry == null || entry.isExpired()) return 0;
        return Math.max(0, entry.expiresAt.getEpochSecond() - Instant.now().getEpochSecond());
    }

    /** Cleans up after successful verification or account deletion. */
    public void invalidate(String email) {
        store.remove(email.toLowerCase());
    }
}
