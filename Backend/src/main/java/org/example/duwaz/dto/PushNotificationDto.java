package org.example.duwaz.dto;

public class PushNotificationDto {

    private String title;
    private String body;
    private String type;      // e.g., "order", "message", "reward"
    private Long targetId;     // e.g., orderId, messageId
    private Long recipientId;  // Student ID to receive notification

    public PushNotificationDto() {}

    public PushNotificationDto(String title, String body, String type, Long targetId) {
        this.title = title;
        this.body = body;
        this.type = type;
        this.targetId = targetId;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }
}
