package thesistrack.ls1.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
@Profile("!test")   // NOTE: this is a workaround to avoid overlapping definitions during test execution
public class WebSecurityConfig {
    private final JwtAuthConverter jwtAuthConverter;

    @Value("${thesis-track.client.host}")
    private String clientHost;

    @Bean
    protected SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new RegisterSessionAuthenticationStrategy(new SessionRegistryImpl());
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers(HttpMethod.GET, "/v2/topics/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/v2/published-theses/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/v2/published-presentations/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/v2/calendar/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/v2/avatars/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/actuator/info").permitAll()
                                .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
                                .anyRequest().authenticated()
                )
                .oauth2ResourceServer(server -> {
                    server.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter));
                });

        return http.build();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry
                        .addMapping("/**")
                        .allowedOrigins(clientHost)
                        .allowedMethods("*");
            }
        };
    }
}
