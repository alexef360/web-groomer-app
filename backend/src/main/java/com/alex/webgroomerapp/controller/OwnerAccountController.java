package com.alex.webgroomerapp.controller;

import com.alex.webgroomerapp.dto.AccountResponse;
import com.alex.webgroomerapp.dto.AccountUpdateRequest;
import com.alex.webgroomerapp.dto.AccountUpdateResponse;
import com.alex.webgroomerapp.dto.ChangePasswordRequest;
import com.alex.webgroomerapp.dto.DeleteAccountRequest;
import com.alex.webgroomerapp.security.AuthSupport;
import com.alex.webgroomerapp.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me/account")
public class OwnerAccountController {

    private final AccountService accountService;

    public OwnerAccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public AccountResponse getAccount() {
        return accountService.getAccount(AuthSupport.currentUserId());
    }

    @PutMapping
    public AccountUpdateResponse updateAccount(@Valid @RequestBody AccountUpdateRequest request) {
        return accountService.updateAccount(AuthSupport.currentUserId(), request);
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        accountService.changePassword(AuthSupport.currentUserId(), request);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@Valid @RequestBody DeleteAccountRequest request) {
        accountService.deleteAccount(AuthSupport.currentUserId(), request);
    }
}
