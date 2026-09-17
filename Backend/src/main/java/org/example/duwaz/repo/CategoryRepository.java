package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    // Get all categories that have at least one AVAILABLE product
    @Query("SELECT DISTINCT c FROM Category c " +
           "JOIN Product p ON p.category.id = c.id " +
           "WHERE p.productStatus = 'AVAILABLE' " +
           "ORDER BY c.name ASC")
    List<Category> findCategoriesWithAvailableProducts();

    // Get all categories with product count
    @Query("SELECT c FROM Category c ORDER BY c.name ASC")
    List<Category> findAllOrderByName();
}
