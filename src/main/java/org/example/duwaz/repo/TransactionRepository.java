package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Find by student
    List<Transaction> findByStudent_Id(Long studentId);

    // Find by status
    List<Transaction> findByStatus(Transaction.TransactionStatus status);

    // Find by date range
    List<Transaction> findByTransactionDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find by amount range
    List<Transaction> findByAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);
}