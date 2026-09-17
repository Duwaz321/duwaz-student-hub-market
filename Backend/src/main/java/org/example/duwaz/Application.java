package org.example.duwaz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@EnableAsync
@EnableCaching
public class Application {

    private static final Logger logger = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args) {
        logger.info("🚀 Starting DUWAZ Student Hub Marketplace...");
        SpringApplication.run(Application.class, args);
        logger.info("✅ DUWAZ application started successfully");
    }

}
