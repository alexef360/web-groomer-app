package com.alex.webgroomerapp.security;

import com.alex.webgroomerapp.exceptions.TooManyRequestsException;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    public void check(String key) {
        Attempt attempt = attempts.get(key);
        if(attempt == null) return;

        if(attempt.isExpired(WINDOW)) {
            attempts.remove(key);
            return;
        }

        if(attempt.count() >= MAX_ATTEMPTS) {
            throw new TooManyRequestsException("Too many login attempts. Please try again later.");
        }
    }

    public void recordFailure(String key) {
      attempts.compute(key, (k, existing) -> {
          Instant now = Instant.now();
          if (existing == null || existing.isExpired(WINDOW)) {
              return new Attempt(1, now);
          }
          return new Attempt(existing.count() + 1, existing.windowStart());
      });
    }

    public void reset(String key) {
        attempts.remove(key);
    }

    private record Attempt (int count, Instant windowStart) {
        boolean isExpired(Duration window) {
            return windowStart.plus(window).isBefore(Instant.now());
        }
    }
}


