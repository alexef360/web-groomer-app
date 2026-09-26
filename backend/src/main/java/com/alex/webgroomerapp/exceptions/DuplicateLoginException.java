package com.alex.webgroomerapp.exceptions;

public class DuplicateLoginException extends RuntimeException{
    public DuplicateLoginException(String login) {
        super("Login " + login + " already exists");
    }
}
