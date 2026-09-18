package org.example.duwaz.service;

import org.example.duwaz.classesFolder.Business;
import org.example.duwaz.classesFolder.Product;
import org.example.duwaz.classesFolder.Product.ProductStatus;
import org.example.duwaz.dto.ProductSummaryDto;
import org.example.duwaz.repo.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Public product listing — used by GET /api/products.
     *
     * Improvements over the original findAll():
     *   1. Uses JOIN FETCH — eliminates N+1 queries (1 SQL instead of N×3)
     *   2. Returns ProductSummaryDto — strips imageUrl2-4 and heavy nested objects
     *   3. Cached for 2 minutes — subsequent requests skip the DB entirely
     *   4. Only returns AVAILABLE products — no need to send OUT_OF_STOCK to customers
     */
    @Cacheable(value = "products", key = "'all-available'")
    @Transactional(readOnly = true)
    public List<ProductSummaryDto> getAllProductsSummary() {
        try {
            // Try the optimized query first with JOIN FETCH
            return productRepository.findAllAvailableWithAssociations(ProductStatus.AVAILABLE)
                    .stream()
                    .map(ProductSummaryDto::from)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("⚠️  JOIN FETCH query failed, trying simple fallback: " + e.getMessage());
            try {
                // Fallback to simple query without joins
                return productRepository.findAllAvailableSimple(ProductStatus.AVAILABLE)
                        .stream()
                        .map(ProductSummaryDto::from)
                        .collect(Collectors.toList());
            } catch (Exception e2) {
                System.err.println("⚠️  Simple query also failed, trying basic: " + e2.getMessage());
                // Last resort: bare minimum query
                return productRepository.findAllAvailableBasic(ProductStatus.AVAILABLE)
                        .stream()
                        .map(ProductSummaryDto::from)
                        .collect(Collectors.toList());
            }
        }
    }

    /**
     * Admin/internal use — returns full Product entities for all statuses.
     * Not cached because admins need real-time data.
     */
    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAllWithAssociations();
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByBusiness(Long businessId) {
        return productRepository.findByBusinessId(businessId);
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByBusinessAndStatus(Long businessId, ProductStatus status) {
        return productRepository.findByBusinessIdAndProductStatus(businessId, status);
    }

    @Transactional(readOnly = true)
    public List<Product> getLowStockProducts(Long businessId, int threshold) {
        return productRepository.findByBusinessIdAndStockQuantityLessThanEqual(businessId, threshold);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));
    }

    /**
     * Evict the product cache whenever a product is created, updated, or deleted.
     * This ensures customers never see stale data.
     */
    @CacheEvict(value = "products", allEntries = true)
    public Product createProduct(Product product) {
        if (product.getStockQuantity() <= 0) {
            product.setProductStatus(ProductStatus.OUT_OF_STOCK);
        }
        return productRepository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product updateProduct(Long id, Product product) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));
        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setCategory(product.getCategory());
        existing.setBusiness(product.getBusiness());
        existing.setStockQuantity(product.getStockQuantity());
        if (product.getProductStatus() != null) {
            existing.setProductStatus(product.getProductStatus());
        }
        if (product.getProductType() != null) {
            existing.setProductType(product.getProductType());
        }
        if (product.getImageUrl() != null) {
            existing.setImageUrl(product.getImageUrl());
        }
        existing.setImageUrl2(product.getImageUrl2());
        existing.setImageUrl3(product.getImageUrl3());
        existing.setImageUrl4(product.getImageUrl4());
        return productRepository.save(existing);
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product adjustStock(Long id, int delta) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));
        int newStock = product.getStockQuantity() + delta;
        if (newStock < 0) throw new RuntimeException("Insufficient stock");
        product.setStockQuantity(newStock);
        return productRepository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void decrementStockForOrder(Long productId, int quantity) {
        productRepository.findById(productId).ifPresent(product -> {
            int newStock = Math.max(0, product.getStockQuantity() - quantity);
            product.setStockQuantity(newStock);
            productRepository.save(product);
        });
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public boolean isOwnedByBusiness(Long productId, Business business) {
        return productRepository.findById(productId)
                .map(p -> p.getBusiness() != null
                        && p.getBusiness().getId().equals(business.getId()))
                .orElse(false);
    }

    public long countByBusiness(Long businessId) {
        return productRepository.countByBusinessId(businessId);
    }

    public long countByBusinessAndStatus(Long businessId, ProductStatus status) {
        return productRepository.countByBusinessIdAndProductStatus(businessId, status);
    }

    public java.math.BigDecimal revenueByBusiness(Long businessId) {
        java.math.BigDecimal rev = productRepository.sumRevenueByBusinessId(businessId);
        return rev != null ? rev : java.math.BigDecimal.ZERO;
    }
}
