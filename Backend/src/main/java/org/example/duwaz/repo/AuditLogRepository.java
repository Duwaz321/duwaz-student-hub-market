package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    long deleteByCreatedAtBefore(LocalDateTime cutoff);
}
