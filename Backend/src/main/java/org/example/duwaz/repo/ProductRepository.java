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
     * Single JOIN FETCH query — resolves all EAGER associations in ONE SQL statement
     * instead of N+1 round-trips to Supabase.
     */
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.business b " +
           "LEFT JOIN FETCH b.student " +
           "WHERE p.productStatus = 'AVAILABLE'")
    @QueryHints(@QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"))
    List<Product> findAllAvailableWithAssociations();

    /**
     * All products (including non-available) with JOIN FETCH — used by admin.
     */
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.business b " +
           "LEFT JOIN FETCH b.student")
    List<Product> findAllWithAssociations();

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
    Page<Product> findByCategoryIdAndProductTypeAndProductStatus(Long categoryId, Product.ProductType type, Product.ProductStatus status, Pageable pageable);
    Page<Product> findByProductTypeAndProductStatus(Product.ProductType type, Product.ProductStatus status, Pageable pageable);

    // Count products by category and status
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = ?1 AND p.productStatus = ?2")
    long countByCategoryAndStatus(Long categoryId, ProductStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.business.id = :businessId AND o.status = 'DELIVERED'")
    java.math.BigDecimal sumRevenueByBusinessId(Long businessId);
}
