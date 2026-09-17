package org.example.duwaz.dto;

import org.example.duwaz.classesFolder.Product;

import java.math.BigDecimal;

/**
 * Lightweight DTO for the public product list endpoint.
 *
 * Strips out imageUrl2, imageUrl3, imageUrl4 (potentially large base64 TEXT columns)
 * and the full student/business objects — the marketplace only needs:
 *   id, name, price, imageUrl (first image), shopName, shopId, categoryId, categoryName, status
 *
 * Reduces JSON payload size significantly when products have multiple base64 images.
 */
public class ProductSummaryDto {

    private Long   id;
    private String name;
    private String description;
    private BigDecimal price;

    // Only the first image — marketplace ProductCard only renders this one
    private String imageUrl;

    private String productStatus;
    private int    stockQuantity;

    // Category (flat — no nested object)
    private Long   categoryId;
    private String categoryName;

    // Business (flat — avoids sending logoUrl, operatingHours, student data)
    private Long   businessId;
    private String businessName;

    public ProductSummaryDto() {}

    /** Build from a fully-loaded Product entity */
    public static ProductSummaryDto from(Product p) {
        ProductSummaryDto dto = new ProductSummaryDto();
        dto.id            = p.getId();
        dto.name          = p.getName();
        dto.description   = p.getDescription();
        dto.price         = p.getPrice();
        dto.imageUrl      = p.getImageUrl();
        dto.productStatus = p.getProductStatus() != null ? p.getProductStatus().name() : "AVAILABLE";
        dto.stockQuantity = p.getStockQuantity();

        if (p.getCategory() != null) {
            dto.categoryId   = p.getCategory().getId();
            dto.categoryName = p.getCategory().getName();
        }
        if (p.getBusiness() != null) {
            dto.businessId   = p.getBusiness().getId();
            dto.businessName = p.getBusiness().getBusinessName();
        }
        return dto;
    }

    // ── Getters ───────────────────────────────────────────────────────────────
    public Long   getId()           { return id; }
    public String getName()         { return name; }
    public String getDescription()  { return description; }
    public BigDecimal getPrice()    { return price; }
    public String getImageUrl()     { return imageUrl; }
    public String getProductStatus(){ return productStatus; }
    public int    getStockQuantity(){ return stockQuantity; }
    public Long   getCategoryId()   { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public Long   getBusinessId()   { return businessId; }
    public String getBusinessName() { return businessName; }
}
