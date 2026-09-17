package org.example.duwaz.config;

import io.sentry.Sentry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PostConstruct;

@Component
@ConditionalOnProperty(prefix = "sentry", name = "dsn")
public class SentryConfig {

    private static final Logger logger = LoggerFactory.getLogger(SentryConfig.class);

    @Value("${sentry.dsn:}")
    private String sentryDsn;

    @Value("${app.environment:development}")
    private String environment;

    @PostConstruct
    public void initSentry() {
        if (sentryDsn != null && !sentryDsn.isEmpty()) {
            Sentry.init(options -> {
                options.setDsn(sentryDsn);
                options.setEnvironment(environment);
                options.setTracesSampleRate(0.1); // Sample 10% of transactions
                options.setDebug(false);
                options.setAttachStacktrace(true);
            });
            logger.info("✅ Sentry initialized with DSN: {}...", sentryDsn.substring(0, Math.min(20, sentryDsn.length())));
        } else {
            logger.warn("⚠️  Sentry DSN not configured. Error tracking disabled.");
        }
    }
}
