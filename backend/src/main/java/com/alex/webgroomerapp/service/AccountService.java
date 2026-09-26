package com.alex.webgroomerapp.service;

import com.alex.webgroomerapp.dto.AccountResponse;
import com.alex.webgroomerapp.dto.AccountUpdateRequest;
import com.alex.webgroomerapp.dto.AccountUpdateResponse;
import com.alex.webgroomerapp.dto.ChangePasswordRequest;
import com.alex.webgroomerapp.dto.DeleteAccountRequest;
import com.alex.webgroomerapp.exceptions.DuplicateLoginException;
import com.alex.webgroomerapp.exceptions.InvalidCredentialsException;
import com.alex.webgroomerapp.exceptions.InvalidDataException;
import com.alex.webgroomerapp.exceptions.UserNotFoundException;
import com.alex.webgroomerapp.model.Customer;
import com.alex.webgroomerapp.model.Pet;
import com.alex.webgroomerapp.model.User;
import com.alex.webgroomerapp.model.Visit;
import com.alex.webgroomerapp.repo.ICustomerRepository;
import com.alex.webgroomerapp.repo.IPetRepository;
import com.alex.webgroomerapp.repo.IUserRepository;
import com.alex.webgroomerapp.repo.IVisitRepository;
import com.alex.webgroomerapp.security.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {

    private final IUserRepository userRepository;
    private final ICustomerRepository customerRepository;
    private final IPetRepository petRepository;
    private final IVisitRepository visitRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AccountService(
            IUserRepository userRepository,
            ICustomerRepository customerRepository,
            IPetRepository petRepository,
            IVisitRepository visitRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.petRepository = petRepository;
        this.visitRepository = visitRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AccountResponse getAccount(Long userId) {
        return toResponse(requireUser(userId), requireCustomer(userId));
    }

    @Transactional
    public AccountUpdateResponse updateAccount(Long userId, AccountUpdateRequest request) {
        User user = requireUser(userId);
        Customer customer = requireCustomer(userId);

        String login = request.login().trim().toLowerCase();
        String email = request.email().trim().toLowerCase();

        if (!user.getLogin().equalsIgnoreCase(login) && userRepository.existsByLogin(login)) {
            throw new DuplicateLoginException(login);
        }

        customerRepository.findByEmailIgnoreCase(email).ifPresent(other -> {
            if (other.getId() != customer.getId()) {
                throw new InvalidDataException("Email already in use");
            }
        });

        boolean loginChanged = !user.getLogin().equalsIgnoreCase(login);
        user.setLogin(login);
        customer.setFirstName(request.firstName().trim());
        customer.setLastName(request.lastName().trim());
        customer.setPhoneNumber(blankToNull(request.phoneNumber()));
        customer.setEmail(email);

        userRepository.save(user);
        customerRepository.save(customer);

        String token = loginChanged ? jwtService.generateToken(user) : null;
        return new AccountUpdateResponse(toResponse(user, customer), token);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = requireUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(Long userId, DeleteAccountRequest request) {
        User user = requireUser(userId);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        Customer customer = requireCustomer(userId);
        List<Visit> visits = visitRepository.findByPet_Customer_User_Id(userId);
        visitRepository.deleteAll(visits);

        List<Pet> pets = petRepository.findByCustomerId(customer.getId());
        petRepository.deleteAll(pets);

        customerRepository.delete(customer);
        userRepository.delete(user);
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }

    private Customer requireCustomer(Long userId) {
        return customerRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }

    private AccountResponse toResponse(User user, Customer customer) {
        return new AccountResponse(
                user.getId(),
                user.getLogin(),
                user.getRole().name(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getPhoneNumber(),
                customer.getEmail()
        );
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
