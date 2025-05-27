package org.example.duwaz.repo;

import org.example.duwaz.classesFolder.DeliverDriver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface DeliverDriverRepository extends JpaRepository<DeliverDriver, Long> {

    // Find driver by email
    Optional<DeliverDriver> findByEmail(String email);

    // Find driver by phone number
    Optional<DeliverDriver> findByContactNumber(String phoneNumber);

    // Find all drivers by vehicle type
    List<DeliverDriver> findByVehicleType(String vehicleType);

    // Find driver by name (might return multiple if names are not unique)
    List<DeliverDriver> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);

    // Check if email exists
    boolean existsByEmail(String email);

    // Check if phone number exists
    boolean existsByContactNumber(String phoneNumber);
}