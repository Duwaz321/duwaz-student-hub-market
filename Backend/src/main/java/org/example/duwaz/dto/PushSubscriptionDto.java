package org.example.duwaz.dto;

public class PushSubscriptionDto {

    private String endpoint;
    private PushSubscriptionKeys keys;

    public PushSubscriptionDto() {}

    public PushSubscriptionDto(String endpoint, PushSubscriptionKeys keys) {
        this.endpoint = endpoint;
        this.keys = keys;
    }

    // Getters and Setters
    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public PushSubscriptionKeys getKeys() {
        return keys;
    }

    public void setKeys(PushSubscriptionKeys keys) {
        this.keys = keys;
    }

    public static class PushSubscriptionKeys {
        private String p256dh;
        private String auth;

        public PushSubscriptionKeys() {}

        public PushSubscriptionKeys(String p256dh, String auth) {
            this.p256dh = p256dh;
            this.auth = auth;
        }

        public String getP256dh() {
            return p256dh;
        }

        public void setP256dh(String p256dh) {
            this.p256dh = p256dh;
        }

        public String getAuth() {
            return auth;
        }

        public void setAuth(String auth) {
            this.auth = auth;
        }
    }
}
