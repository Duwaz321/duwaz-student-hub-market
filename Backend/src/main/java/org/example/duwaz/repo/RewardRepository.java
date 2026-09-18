package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.Rewards;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRepository extends JpaRepository<Rewards, Long> {
    
    /**
     * Get all rewards for a student, ordered by most recent first
     */
    List<Rewards> findByStudentIdOrderByEarnedAtDesc(Long studentId);
    
    /**
     * Sum all reward points for a student
     */
    @Query("SELECT COALESCE(SUM(r.points), 0) FROM Rewards r WHERE r.student.id = ?1")
    int sumPointsByStudentId(Long studentId);
}
