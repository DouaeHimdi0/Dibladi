package com.dibladi.dibladibackend.config;

import com.dibladi.dibladibackend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/**").permitAll()
                .requestMatchers("/api/upload/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/parent-categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**", "/api/brands/**", "/api/vendors", "/api/products", "/api/products/*", "/api/products/all", "/api/products/search", "/api/search/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/*/variants", "/api/categories/*/attributes").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/orders").hasAuthority("CLIENT")
                .requestMatchers(HttpMethod.GET, "/api/orders/my-orders").hasAuthority("CLIENT")
                .requestMatchers(HttpMethod.GET, "/api/orders/search").hasAuthority("CLIENT")
                .requestMatchers(HttpMethod.GET, "/api/orders/vendor-orders").hasAuthority("VENDOR")
                .requestMatchers(HttpMethod.POST, "/api/products").hasAuthority("VENDOR")
                .requestMatchers(HttpMethod.PUT, "/api/products/*").hasAuthority("VENDOR")
                .requestMatchers(HttpMethod.PUT, "/api/products/*/variants/*", "/api/products/*/variants").hasAuthority("VENDOR")
                .requestMatchers(HttpMethod.POST, "/api/products/*/variants").hasAuthority("VENDOR")
                .requestMatchers(HttpMethod.DELETE, "/api/products/*").hasAuthority("VENDOR")
                .requestMatchers(HttpMethod.GET, "/api/products/vendor/me").hasAuthority("VENDOR")
                // Reviews: allow public GET to fetch reviews by product, but protect write/vendor actions
                .requestMatchers(HttpMethod.GET, "/api/reviews").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/reviews").hasAuthority("CLIENT")
                .requestMatchers(HttpMethod.GET, "/api/reviews/vendor").hasAuthority("VENDOR")
                .requestMatchers(HttpMethod.PUT, "/api/reviews/*/reply").hasAuthority("VENDOR")
                .requestMatchers(HttpMethod.DELETE, "/api/reviews/*").hasAuthority("VENDOR")
                .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }
}
