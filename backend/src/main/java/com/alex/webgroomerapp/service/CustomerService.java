package com.alex.webgroomerapp.service;

import com.alex.webgroomerapp.dto.CustomerRequest;
import com.alex.webgroomerapp.dto.CustomerResponse;
import com.alex.webgroomerapp.exceptions.CustomerNotFoundException;
import com.alex.webgroomerapp.model.Customer;
import com.alex.webgroomerapp.repo.ICustomerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

private final ICustomerRepository customerRepository;

public CustomerService(ICustomerRepository customerRepository) {
    this.customerRepository = customerRepository;
}

public List<CustomerResponse> findAll() {
    return customerRepository.findAll().stream()
            .map(this::toResponse)
            .limit(50)
            .toList();
}

public List<CustomerResponse> search(String q) {
    if (q == null || q.isBlank()) {
        return findAll();
    }
    return customerRepository.search(q.trim()).stream()
            .map(this::toResponse)
            .limit(50)
            .toList();
}


public CustomerResponse getById(Long id) {
    Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new CustomerNotFoundException(id));
    return toResponse(customer);
}

@Transactional
public CustomerResponse create(CustomerRequest request) {
    Customer customer = new Customer();
    customer.setFirstName(request.firstName());
    customer.setLastName(request.lastName());
    customer.setPhoneNumber(request.phoneNumber());
    customer.setEmail(request.email());
    customer = customerRepository.save(customer);
    return toResponse(customer);
}

@Transactional
public CustomerResponse update(Long id, CustomerRequest request) {
    Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new CustomerNotFoundException(id));
    customer.setFirstName(request.firstName());
    customer.setLastName(request.lastName());
    customer.setPhoneNumber(request.phoneNumber());
    customer.setEmail(request.email());
    customer = customerRepository.save(customer);
    return toResponse(customer);
}


private CustomerResponse toResponse(Customer customer) {
    Long userId = null;

    if (customer.getUser() != null) {
        userId = customer.getUser().getId();
    }

    return new CustomerResponse(
            customer.getId(),
            customer.getFirstName(),
            customer.getLastName(),
            customer.getPhoneNumber(),
            customer.getEmail(),
            userId);
}
}

