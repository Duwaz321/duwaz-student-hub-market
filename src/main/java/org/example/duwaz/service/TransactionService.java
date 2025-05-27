package org.example.duwaz.service;

import org.example.duwaz.classesFolder.Transaction;
import org.example.duwaz.repo.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    public List<Transaction> getTransactionsByStudentId(Long studentId) {
        return transactionRepository.findByStudent_Id(studentId);
    }

    public List<Transaction> getTransactionsByStatus(Transaction.TransactionStatus status) {
        return transactionRepository.findByStatus(status);
    }

    public List<Transaction> getTransactionsByDateRange(LocalDateTime start, LocalDateTime end) {
        return transactionRepository.findByTransactionDateBetween(start, end);
    }

    public List<Transaction> getTransactionsByAmountRange(BigDecimal min, BigDecimal max) {
        return transactionRepository.findByAmountBetween(min, max);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }
}

