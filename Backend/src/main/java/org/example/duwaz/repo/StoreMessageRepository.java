package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.StoreMessage;
import org.example.duwaz.classesFolder.StoreMessage.MessageStatus;
import org.example.duwaz.classesFolder.StoreMessage.MessageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreMessageRepository extends JpaRepository<StoreMessage, Long> {
    List<StoreMessage> findByBusinessIdOrderBySentAtDesc(Long businessId);
    List<StoreMessage> findByDriverDeliveryDriverIdOrderBySentAtDesc(Long driverId);
    List<StoreMessage> findByStatusOrderBySentAtDesc(MessageStatus status);
    List<StoreMessage> findAllByOrderBySentAtDesc();
    List<StoreMessage> findAllByOrderIdOrderBySentAtDesc(Long orderId);
    List<StoreMessage> findByCustomerIdAndMessageTypeAndConversationRootIsNullOrderBySentAtDesc(
            Long customerId, MessageType messageType);
    @Query("SELECT m FROM StoreMessage m WHERE m.id = :rootId OR m.conversationRoot.id = :rootId ORDER BY m.sentAt ASC")
    List<StoreMessage> findConversation(@Param("rootId") Long rootId);
    boolean existsByOrderIdAndMessageType(Long orderId, MessageType type);
    long countByStatusAndFromAdminFalse(MessageStatus status);
    // Count unread messages for a specific driver
    long countByDriverDeliveryDriverIdAndStatusAndFromAdminTrue(Long driverId, MessageStatus status);
}
