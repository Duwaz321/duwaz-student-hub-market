package org.example.duwaz.classesFolder;

import jakarta.persistence.*;

@Entity
@Table(name = "delivery_drivers")
public class DeliverDriver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_driver_id")
    private Long deliveryDriverId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "contact_number", nullable = false, unique = true)
    private String contactNumber;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "vehicle_type", nullable = false)
    private String vehicleType;  // Type of vehicle the driver uses (e.g., car, motorbike, bicycle)

    @Column(name = "license_number", nullable = false, unique = true)
    private String licenseNumber;  // Driver's license number

    @Column(name = "delivery_count", nullable = false)
    private int deliveryCount;  // Number of deliveries completed by the driver

    @Column(name = "rating")
    private float rating;  // Average rating of the driver by customers

    // Constructors, getters, and setters

    public DeliverDriver() {
    }

    public DeliverDriver(String firstName, String lastName, String contactNumber, String email, String vehicleType, String licenseNumber, int deliveryCount, float rating) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.contactNumber = contactNumber;
        this.email = email;
        this.vehicleType = vehicleType;
        this.licenseNumber = licenseNumber;
        this.deliveryCount = deliveryCount;
        this.rating = rating;
    }

    public Long getDeliveryDriverId() {
        return deliveryDriverId;
    }

    public void setDeliveryDriverId(Long deliveryDriverId) {
        this.deliveryDriverId = deliveryDriverId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public int getDeliveryCount() {
        return deliveryCount;
    }

    public void setDeliveryCount(int deliveryCount) {
        this.deliveryCount = deliveryCount;
    }

    public float getRating() {
        return rating;
    }

    public void setRating(float rating) {
        this.rating = rating;
    }

    public void setId(Long id) {

    }
}
