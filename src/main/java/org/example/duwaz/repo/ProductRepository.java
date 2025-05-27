package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Find product by name
    Product findByName(String name);
    
    // Find products by category id
    List<Product> findByCategoryId(Long categoryId);
    
    // Find products by price less than
    List<Product> findByPriceLessThan(Double price);
    
    // Find products by price greater than
    List<Product> findByPriceGreaterThan(Double price);
    
    // Find products by price between
    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);
    
    // Find products by name containing (case-insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // Find products by category name
    List<Product> findByCategoryName(String categoryName);
    
    // Check if product exists by name
    boolean existsByName(String name);
}