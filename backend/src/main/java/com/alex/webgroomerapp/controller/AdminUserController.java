package com.alex.webgroomerapp.controller;

import com.alex.webgroomerapp.dto.AuthResponse;
import com.alex.webgroomerapp.dto.CreateStaffRequest;
import com.alex.webgroomerapp.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return adminUserService.createStaff(request);
    }

    @GetMapping
    public List<AuthResponse> listUsers() {
        return adminUserService.listUsers();
    }

    @PatchMapping("/{id}/enabled")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setEnabled(@PathVariable Long id, @RequestParam boolean enabled) {
        adminUserService.setEnabled(id, enabled);
    }
}
