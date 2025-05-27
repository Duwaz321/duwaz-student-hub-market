package org.example.duwaz.service;

import org.example.duwaz.classesFolder.Business;
import org.example.duwaz.repo.BusinessRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BusinessService {
    private final BusinessRepository businessRepository;

    public BusinessService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }
    public Business saveBusiness(Business business) {
        return businessRepository.save(business);
    }

    public Business findBusinessById(Long id) {
        return businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id " + id));
    }

    public List<Business> getAllBusiness() {
        return businessRepository.findAll();
    }

    public Business updateBusiness(Business business) {
        return businessRepository.save(business);
    }

    public boolean deleteBusinessById(Long id) {
    businessRepository.deleteById(id);
    return !businessRepository.existsById(id);

}
}