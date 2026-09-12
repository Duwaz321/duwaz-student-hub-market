package org.example.duwaz.dto;

/**
 * Returned to the frontend after order is created and Yoco checkout is initiated.
 * Frontend redirects the customer to redirectUrl.
 */
public class PaymentInitiateResponse {

    private Long orderId;
    private String checkoutId;
    private String redirectUrl;

    public PaymentInitiateResponse() {}

    public PaymentInitiateResponse(Long orderId, String checkoutId, String redirectUrl) {
        this.orderId = orderId;
        this.checkoutId = checkoutId;
        this.redirectUrl = redirectUrl;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getCheckoutId() { return checkoutId; }
    public void setCheckoutId(String checkoutId) { this.checkoutId = checkoutId; }

    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }
}
