package org.example.duwaz.controller;

import org.example.duwaz.classesFolder.Category;
import org.example.duwaz.classesFolder.Product;
import org.example.duwaz.repo.CategoryRepository;
import org.example.duwaz.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;

    // ── Get all categories with product counts (fast listing for UI) ───────────
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(
            @RequestParam(defaultValue = "false") boolean includeEmpty) {
        try {
            List<Category> categories;
            if (includeEmpty) {
                categories = categoryRepository.findAllOrderByName();
            } else {
                categories = categoryRepository.findCategoriesWithAvailableProducts();
            }

            // Count products per category
            List<Map<String, Object>> result = categories.stream()
                    .map(cat -> {
                        Map<String, Object> catMap = new HashMap<>();
                        catMap.put("id", cat.getId());
                        catMap.put("name", cat.getName());
                        // Count available products in this category
                        long productCount = productRepository.countByCategoryAndStatus(cat.getId(), Product.ProductStatus.AVAILABLE);
                        catMap.put("productCount", productCount);
                        return catMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.err.println("[CatalogController] getCategories error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching categories: " + e.getMessage());
        }
    }

    // ── Get products by category with pagination ──────────────────────────────
    @GetMapping("/products/by-category/{categoryId}")
    public ResponseEntity<?> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Product> products = productRepository.findByCategoryIdAndProductStatus(
                    categoryId,
                    Product.ProductStatus.AVAILABLE,
                    pageable
            );

            return ResponseEntity.ok(Map.of(
                    "content", products.getContent(),
                    "totalPages", products.getTotalPages(),
                    "totalElements", products.getTotalElements(),
                    "currentPage", page,
                    "pageSize", size
            ));

        } catch (Exception e) {
            System.err.println("[CatalogController] getProductsByCategory error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching products: " + e.getMessage());
        }
    }

    // ── Get services (SERVICE type products) with pagination ─────────────────
    @GetMapping("/services")
    public ResponseEntity<?> getServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Product> services = productRepository.findByProductTypeAndStatus(
                    Product.ProductType.SERVICE,
                    Product.ProductStatus.AVAILABLE,
                    pageable
            );

            return ResponseEntity.ok(Map.of(
                    "content", services.getContent(),
                    "totalPages", services.getTotalPages(),
                    "totalElements", services.getTotalElements(),
                    "currentPage", page,
                    "pageSize", size
            ));

        } catch (Exception e) {
            System.err.println("[CatalogController] getServices error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching services: " + e.getMessage());
        }
    }

    // ── Get services by category ─────────────────────────────────────────────
    @GetMapping("/services/by-category/{categoryId}")
    public ResponseEntity<?> getServicesByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Product> services = productRepository.findByProductTypeAndCategoryAndStatus(
                    Product.ProductType.SERVICE,
                    categoryId,
                    Product.ProductStatus.AVAILABLE,
                    pageable
            );

            return ResponseEntity.ok(Map.of(
                    "content", services.getContent(),
                    "totalPages", services.getTotalPages(),
                    "totalElements", services.getTotalElements(),
                    "currentPage", page,
                    "pageSize", size
            ));

        } catch (Exception e) {
            System.err.println("[CatalogController] getServicesByCategory error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching services: " + e.getMessage());
        }
    }

    // ── Get all available products with fast load (cached) ───────────────────
    @GetMapping("/products/featured")
    public ResponseEntity<?> getFeaturedProducts() {
        try {
            List<Product> products = productRepository.findAllAvailableWithAssociations(Product.ProductStatus.AVAILABLE);
            return ResponseEntity.ok(products);

        } catch (Exception e) {
            System.err.println("[CatalogController] getFeaturedProducts error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching featured products: " + e.getMessage());
        }
    }
}
