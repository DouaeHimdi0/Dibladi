package com.dibladi.dibladibackend.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Endpoint d'upload d'images pour les vendeurs et les produits.
 * Accessible sans authentification pour permettre l'upload préalable à la création de compte ou de produit.
 */
@Slf4j
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            ".jpg", ".jpeg", ".png", ".webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024L;

    @Value("${app.upload-dir:uploads/vendor-photos}")
    private String uploadDir;

    /**
     * POST /api/upload/vendor-photo
     */
    @PostMapping("/vendor-photo")
    public ResponseEntity<Map<String, String>> uploadVendorPhoto(
            @RequestParam("file") MultipartFile file) throws IOException {
        return saveUploadedFile(file);
    }

    /**
     * POST /api/upload/product-image
     *
     * Accepte un fichier image unique, le sauvegarde sous uploads/ et retourne une URL HTTP absolue
     * exploitable en base de données : http://localhost:8082/uploads/... .
     */
    @PostMapping("/product-image")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @RequestParam("file") MultipartFile file) throws IOException {
        return saveUploadedFile(file);
    }

    private ResponseEntity<Map<String, String>> saveUploadedFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le fichier est vide."));
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.status(413)
                    .body(Map.of("error", "Le fichier dépasse la taille maximale autorisée (5 Mo)."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Type de fichier non autorisé. Formats acceptés : jpg, jpeg, png, webp."));
        }

        String originalFilename = file.getOriginalFilename() != null
                ? file.getOriginalFilename().toLowerCase()
                : "";
        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Extension de fichier non autorisée. Extensions acceptées : .jpg, .jpeg, .png, .webp."));
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("[UploadController] Dossier créé : {}", uploadPath);
        }

        String uniqueFilename = UUID.randomUUID() + extension;
        Path targetPath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        log.info("[UploadController] Fichier uploadé : {}", targetPath);

        String relativeUrl = "/" + uploadDir.replace("\\", "/") + "/" + uniqueFilename;
        String absoluteUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(relativeUrl)
                .toUriString();

        return ResponseEntity.ok(Map.of("url", absoluteUrl));
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0) return "";
        return filename.substring(dotIndex);
    }
}
