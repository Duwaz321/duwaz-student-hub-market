package org.example.duwaz.dto;

import java.time.LocalDateTime;

/**
 * DTO for WebSocket real-time messaging between shop owners and customers
 */
public class WebSocketMessage {

    private Long orderId;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime timestamp;
    private String type; // "message", "typing", "notification"
    private boolean isRead;

    public WebSocketMessage() {}

    public WebSocketMessage(Long orderId, Long senderId, String senderName, String content) {
        this.orderId = orderId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.type = "message";
        this.isRead = false;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
}
