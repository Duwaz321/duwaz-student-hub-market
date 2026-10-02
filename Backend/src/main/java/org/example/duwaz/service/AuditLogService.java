package org.example.duwaz.service;

import org.example.duwaz.classesFolder.AuditLog;
import org.example.duwaz.repo.AuditLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    private final AuditLogRepository repository;

    @Value("${app.audit.retention-days:730}")
    private int retentionDays;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void record(String actorEmail, String action, String resourceType, String resourceId, String metadata) {
        try {
            repository.save(new AuditLog(actorEmail, action, resourceType, resourceId, metadata));
        } catch (RuntimeException ignored) {
            // Audit logging must not make a successful user action fail.
        }
    }

    @Transactional
    @Scheduled(cron = "${app.audit.cleanup-cron:0 20 3 * * *}")
    public void purgeExpiredAuditLogs() {
        if (retentionDays > 0) {
            repository.deleteByCreatedAtBefore(LocalDateTime.now().minusDays(retentionDays));
        }
    }
}
