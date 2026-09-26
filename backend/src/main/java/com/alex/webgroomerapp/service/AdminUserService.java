package com.alex.webgroomerapp.service;

import com.alex.webgroomerapp.dto.AuthResponse;
import com.alex.webgroomerapp.dto.CreateStaffRequest;
import com.alex.webgroomerapp.exceptions.DuplicateLoginException;
import com.alex.webgroomerapp.exceptions.InvalidDataException;
import com.alex.webgroomerapp.exceptions.UserNotFoundException;
import com.alex.webgroomerapp.model.GroomerProfile;
import com.alex.webgroomerapp.model.User;
import com.alex.webgroomerapp.model.UserRole;
import com.alex.webgroomerapp.repo.IGroomerProfileRepository;
import com.alex.webgroomerapp.repo.IUserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminUserService {

    private final IUserRepository iUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final IGroomerProfileRepository iGroomerProfileRepository;

    public AdminUserService(IUserRepository iUserRepository, PasswordEncoder passwordEncoder, IGroomerProfileRepository iGroomerProfileRepository) {
        this.iUserRepository = iUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.iGroomerProfileRepository = iGroomerProfileRepository;
    }

    @Transactional
    public AuthResponse createStaff(CreateStaffRequest request) {
        if(request.role() != UserRole.RECEPTION && request.role() != UserRole.GROOMER) {
            throw new InvalidDataException("Role must be RECEPTION or GROOMER");
        }
        String login = request.login().toLowerCase();
        if(iUserRepository.existsByLogin(login)) {
            throw new DuplicateLoginException(login);
        }
        if(request.role() == UserRole.GROOMER && (request.displayName() == null || request.displayName().isBlank())) {
            throw new InvalidDataException("Groomer must have a display name");
        }

        User user = new User();
        user.setLogin(login);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setEnabled(true);
        user = iUserRepository.save(user);

        if(request.role() == UserRole.GROOMER) {
            GroomerProfile profile = new GroomerProfile();
            profile.setDisplayName(request.displayName());
            profile.setActive(true);
            profile.setUser(user);
            iGroomerProfileRepository.save(profile);
        }

        return new AuthResponse(
                user.getId(),
                user.getLogin(),
                user.getRole(),
                request.role() == UserRole.GROOMER ? request.displayName() : null,
                null
        );
    }

    public List<AuthResponse> listUsers() {
        return iUserRepository.findAll().stream()
                .map(u -> new AuthResponse(u.getId(), u.getLogin(), u.getRole(), null, null))
                .toList();
    }

    @Transactional
    public void setEnabled(Long id, boolean enabled) {
        User user = iUserRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        user.setEnabled(enabled);
        iUserRepository.save(user);
    }
}
