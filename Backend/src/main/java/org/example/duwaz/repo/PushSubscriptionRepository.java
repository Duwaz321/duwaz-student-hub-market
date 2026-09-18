package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.PushSubscription;
import org.example.duwaz.classesFolder.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

    List<PushSubscription> findByStudentAndActiveTrue(Student student);

    List<PushSubscription> findByActiveTrue();

    Optional<PushSubscription> findByEndpoint(String endpoint);

    void deleteByEndpoint(String endpoint);
}
