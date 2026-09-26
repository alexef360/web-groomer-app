package com.alex.webgroomerapp.exceptions;

public class VisitNotFoundException extends RuntimeException {
    public VisitNotFoundException(Long id) {
        super("Visit with id " + id + " not found");
    }
}
