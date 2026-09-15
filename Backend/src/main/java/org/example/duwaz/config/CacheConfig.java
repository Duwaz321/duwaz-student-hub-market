package org.example.duwaz.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * In-memory cache using Caffeine.
 * No Redis or external infrastructure needed — runs inside the JVM.
 *
 * "products" cache: 2-minute TTL, max 500 entries.
 *   - Eliminates repeated DB round-trips to Supabase for unchanged catalogs.
 *   - Automatically evicted when any product is created/updated/deleted.
 */
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("products");
        manager.setCaffeine(
            Caffeine.newBuilder()
                .expireAfterWrite(2, TimeUnit.MINUTES)
                .maximumSize(500)
                .recordStats()
        );
        return manager;
    }
}
