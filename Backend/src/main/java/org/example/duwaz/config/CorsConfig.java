package org.example.duwaz.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CorsConfig is intentionally minimal here.
 * The primary CORS configuration is handled inside SecurityConfig
 * via CorsConfigurationSource, which takes precedence for secured endpoints.
 * This class handles any non-security-filtered paths (e.g. static resources).
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:*",
                    "https://localhost:*",
                    "https://*.duwaz.co.za",
                    "http://*.duwaz.co.za",
                    "https://duwaz.co.za",
                    "https://www.duwaz.co.za"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
                .allowedHeaders("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "X-CSRF-Token")
                .exposedHeaders("Authorization")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
