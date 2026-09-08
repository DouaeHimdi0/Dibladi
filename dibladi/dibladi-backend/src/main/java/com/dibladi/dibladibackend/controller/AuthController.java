package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.AuthRequest;
import com.dibladi.dibladibackend.dto.AuthResponse;
import com.dibladi.dibladibackend.dto.ClientRegisterRequest;
import com.dibladi.dibladibackend.dto.VendorRegisterRequest;
import com.dibladi.dibladibackend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
        AuthResponse response = userService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Inscription client : crée le compte User + le profil Client lié.
     */
    @PostMapping("/register/client")
    public ResponseEntity<Object> registerClient(@Valid @RequestBody ClientRegisterRequest request) {
        try {
            String message = userService.registerClient(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(java.util.Map.of("message", message));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Inscription vendeur : crée une VendorRequest avec status = PENDING.
     * Aucun compte User/Vendor n'est créé ici — l'approbation admin le fera.
     */
    @PostMapping("/register/vendor")
    public ResponseEntity<Object> registerVendor(@Valid @RequestBody VendorRegisterRequest request) {
        try {
            String message = userService.registerVendorRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(java.util.Map.of("message", message));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("error", ex.getMessage()));
        }
    }
}
