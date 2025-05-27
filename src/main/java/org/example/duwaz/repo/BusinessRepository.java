package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    Business findBusinessById(Long id);
}