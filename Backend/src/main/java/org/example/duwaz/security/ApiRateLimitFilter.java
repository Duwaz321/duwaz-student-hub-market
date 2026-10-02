package org.example.duwaz.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ApiRateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MILLIS = 60_000L;

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    @Value("${security.rate-limit.auth-per-minute:10}")
    private int authLimit;

    @Value("${security.rate-limit.payment-per-minute:30}")
    private int paymentLimit;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        int limit = limitFor(request);
        if (limit <= 0) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = request.getRemoteAddr() + ":" + request.getRequestURI();
        long now = System.currentTimeMillis();
        Window window = windows.compute(key, (ignored, current) -> {
            if (current == null || now - current.startedAt >= WINDOW_MILLIS) {
                return new Window(now);
            }
            current.requests.incrementAndGet();
            return current;
        });

        if (window.requests.get() > limit) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            return;
        }

        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(entry -> now - entry.getValue().startedAt >= WINDOW_MILLIS);
        }
        filterChain.doFilter(request, response);
    }

    private int limitFor(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) return 0;
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/") || path.equals("/api/auth")) return authLimit;
        if (path.startsWith("/api/payment/") && !path.equals("/api/payment/webhook")) return paymentLimit;
        return 0;
    }

    private static final class Window {
        private final long startedAt;
        private final AtomicInteger requests = new AtomicInteger(1);

        private Window(long startedAt) {
            this.startedAt = startedAt;
        }
    }
}
