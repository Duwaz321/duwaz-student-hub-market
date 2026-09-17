package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByOrder_IdOrderByCreatedAtDesc(Long orderId);
    List<Message> findByOrder_IdAndIsReadFalseOrderByCreatedAtAsc(Long orderId);
    int countByOrder_IdAndIsReadFalse(Long orderId);

    // Count unread messages for a shop owner
    @Query("SELECT COUNT(m) FROM Message m WHERE m.order.business.student.id = ?1 AND m.isRead = false")
    long countUnreadForShopOwner(Long studentId);
}

