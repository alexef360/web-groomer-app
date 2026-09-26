package com.alex.webgroomerapp.dto;

public record ErrorResponse(int status, String message, String path) {
}
