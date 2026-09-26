package com.alex.webgroomerapp.security;

import com.alex.webgroomerapp.exceptions.TooManyRequestsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class LoginRateLimiterTest {

    private LoginRateLimiter limiter;

    @BeforeEach
    void setUp() {
        limiter = new LoginRateLimiter();
    }

    @Test
    void allowsUpToFiveFailure() {
        String ip = "1.2.3.4";
        for(int i =0; i < 5; i++) {
            limiter.check(ip);
            limiter.recordFailure(ip);
        }
        assertThrows(TooManyRequestsException.class, () -> limiter.check(ip));
    }

    @Test
    void resetClearsFailures() {
        String ip = "1.2.3.4";
        for(int i = 0; i < 5; i++) {
            limiter.recordFailure(ip);
        }
        limiter.reset(ip);
        assertDoesNotThrow(() -> limiter.check(ip));
    }

    @Test
    void differentIpsAreIndependent() {
        for(int i = 0; i < 5; i++) {
            limiter.recordFailure("10.2.42.1");
        }
        assertDoesNotThrow(() -> limiter.check("1.2.3.4"));
    }
}
