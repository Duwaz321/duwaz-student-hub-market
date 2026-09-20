package org.example.duwaz.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

/**
 * Sent by the frontend when the customer clicks "Make Payment".
 * Contains everything needed to create the order + initiate Yoco checkout.
 */
public class PaymentInitiateRequest {

    @NotNull
    private BigDecimal totalAmount;

    private String deliveryAddress;

    @NotNull
    private Long businessId;

    @NotNull
    private List<ItemDto> items;

    public static class ItemDto {
        @NotNull
        private Long productId;

        @Positive
        private int quantity;

        @NotNull
        @DecimalMin(value = "0.00", inclusive = false)
        private BigDecimal unitPrice;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }

    public List<ItemDto> getItems() { return items; }
    public void setItems(List<ItemDto> items) { this.items = items; }
}
