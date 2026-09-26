package com.alex.webgroomerapp.exceptions;

public class PetNotFoundException extends RuntimeException{
    public PetNotFoundException(Long id) {
        super("Pet with id " + id + " not found");
    }

}
