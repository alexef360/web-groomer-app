package com.alex.webgroomerapp.repo;

import com.alex.webgroomerapp.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ICustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUserId(Long userId);

    Optional<Customer> findByEmailIgnoreCase(String email);

    @Query("""
            SELECT c FROM Customer c
            WHERE LOWER(c.firstName) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(COALESCE(c.phoneNumber, '')) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :q, '%'))
            """)
    List<Customer> search(@Param("q") String q);
}
