package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStudentId(Long studentId);

    List<Order> findByStatus(String status);
}