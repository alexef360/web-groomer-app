package com.alex.webgroomerapp.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank
    private String login;

    @NotBlank
    private String password;

    public String getLogin() {
        return login;
    }

    public String getPassword() {
        return password;
    }

    public void setLogin(String login) {
        this.login = login.toLowerCase();
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
