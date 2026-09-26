package com.alex.webgroomerapp.service;

import com.alex.webgroomerapp.dto.AuthResponse;
import com.alex.webgroomerapp.dto.LoginRequest;
import com.alex.webgroomerapp.dto.RegisterRequest;
import com.alex.webgroomerapp.exceptions.DuplicateLoginException;
import com.alex.webgroomerapp.exceptions.InvalidCredentialsException;
import com.alex.webgroomerapp.model.Customer;
import com.alex.webgroomerapp.model.GroomerProfile;
import com.alex.webgroomerapp.model.User;
import com.alex.webgroomerapp.model.UserRole;
import com.alex.webgroomerapp.repo.ICustomerRepository;
import com.alex.webgroomerapp.repo.IGroomerProfileRepository;
import com.alex.webgroomerapp.repo.IUserRepository;
import com.alex.webgroomerapp.security.JwtService;
import com.alex.webgroomerapp.security.LoginRateLimiter;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final IUserRepository userRepository;
    private final ICustomerRepository customerRepository;
    private final IGroomerProfileRepository groomerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginRateLimiter loginRateLimiter;

    public AuthService(
            IUserRepository userRepository,
            ICustomerRepository customerRepository,
            IGroomerProfileRepository groomerProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService, LoginRateLimiter loginRateLimiter
    ) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.groomerProfileRepository = groomerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.loginRateLimiter = loginRateLimiter;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String login = resolveLogin(request);
        if (userRepository.existsByLogin(login)) {
            throw new DuplicateLoginException(login);
        }

        User user = new User();
        user.setLogin(login);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.PET_OWNER);
        user.setEnabled(true);
        user = userRepository.save(user);

        Customer customer = new Customer();
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setEmail(request.getEmail().trim().toLowerCase());
        customer.setUser(user);
        customerRepository.save(customer);

        String token = jwtService.generateToken(user);
        return new AuthResponse(
                user.getId(),
                user.getLogin(),
                user.getRole(),
                customer.getFirstName(),
                token
        );
    }

    public AuthResponse login(LoginRequest request, String clientIp) {
        loginRateLimiter.check(clientIp);

        User user = userRepository.findByLogin(request.getLogin())
                .orElse(null);

        boolean badCredentials = user == null
                || !user.isEnabled()
                || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

       if (badCredentials) {
           loginRateLimiter.recordFailure(clientIp);
           throw new InvalidCredentialsException();
       }

       loginRateLimiter.reset(clientIp);

        String token = jwtService.generateToken(user);
        return new AuthResponse(
                user.getId(),
                user.getLogin(),
                user.getRole(),
                resolveDisplayName(user),
                token
        );
    }

    private String resolveDisplayName(User user) {
        if (user.getRole() == UserRole.PET_OWNER) {
            return customerRepository.findByUserId(user.getId())
                    .map(Customer::getFirstName)
                    .orElse(null);
        }
        if (user.getRole() == UserRole.GROOMER) {
            return groomerProfileRepository.findByUserId(user.getId())
                    .map(GroomerProfile::getDisplayName)
                    .orElse(null);
        }
        return null;
    }

    private static String resolveLogin(RegisterRequest request) {
        String login = request.getLogin();
        if (login == null || login.isBlank()) {
            login = request.getEmail();
        }
        return login.trim().toLowerCase();
    }
}
