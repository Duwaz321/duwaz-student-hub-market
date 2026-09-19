package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.Product;
import org.example.duwaz.classesFolder.Product.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.stereotype.Repository;

import jakarta.persistence.QueryHint;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * SIMPLE: Get all available products with ZERO joins
     * Just load Product entities - let Hibernate lazy-load relationships as needed
     * This is the most reliable fallback when complex queries fail
     */
    @Query("SELECT p FROM Product p WHERE p.productStatus = :status")
    List<Product> findAllAvailableSimple(
           @org.springframework.data.repository.query.Param("status") ProductStatus status);

    /**
     * Simple JOIN FETCH query — fetches only Product with Category and Business
     * Avoids cartesian product by not nesting Student fetch
     * Student will be lazy-loaded if needed (usually already cached)
     */
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.business " +
           "WHERE p.productStatus = :status")
    @QueryHints(@QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"))
    List<Product> findAllAvailableWithAssociations(
           @org.springframework.data.repository.query.Param("status") ProductStatus status);

    /**
     * All products (including non-available) with simple JOIN FETCH
     */
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.business")
    List<Product> findAllWithAssociations();

    /**
     * FALLBACK: Simple query without JOIN FETCH if above queries fail
     * This will cause N+1 but at least returns data
     */
    @Query("SELECT p FROM Product p WHERE p.productStatus = :status")
    List<Product> findAllAvailableBasic(
           @org.springframework.data.repository.query.Param("status") ProductStatus status);

    Product findByName(String name);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByBusinessId(Long businessId);
    List<Product> findByBusinessIdAndProductStatus(Long businessId, ProductStatus status);
    List<Product> findByBusinessIdAndStockQuantityLessThanEqual(Long businessId, int threshold);
    List<Product> findByNameContainingIgnoreCase(String name);
    boolean existsByName(String name);

    long countByBusinessId(Long businessId);
    long countByBusinessIdAndProductStatus(Long businessId, ProductStatus status);

    // Pagination queries
    Page<Product> findByCategoryIdAndProductStatus(Long categoryId, Product.ProductStatus status, Pageable pageable);
    
    // Service-specific queries (product_type = 'SERVICE')
    @Query("SELECT p FROM Product p WHERE p.productType = :productType AND p.productStatus = :status")
    Page<Product> findByProductTypeAndStatus(@org.springframework.data.repository.query.Param("productType") String productType, @org.springframework.data.repository.query.Param("status") Product.ProductStatus status, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.productType = :productType AND p.category.id = :categoryId AND p.productStatus = :status")
    Page<Product> findByProductTypeAndCategoryAndStatus(@org.springframework.data.repository.query.Param("productType") String productType, @org.springframework.data.repository.query.Param("categoryId") Long categoryId, @org.springframework.data.repository.query.Param("status") Product.ProductStatus status, Pageable pageable);

    // Count products by category and status
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = ?1 AND p.productStatus = ?2")
    long countByCategoryAndStatus(Long categoryId, ProductStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.business.id = :businessId AND o.status = 'DELIVERED'")
    java.math.BigDecimal sumRevenueByBusinessId(Long businessId);
}
