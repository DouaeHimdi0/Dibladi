package com.dibladi.dibladibackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO pour la demande d'inscription d'un vendeur.
 * Le vendeur choisi son mot de passe à l'inscription.
 */
@Data
public class VendorRegisterRequest {

    @NotBlank(message = "Le prénom est obligatoire")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    private String lastName;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    private String phone;

    @NotBlank(message = "Le nom de la boutique est obligatoire")
    private String shopName;

    @NotBlank(message = "La ville est obligatoire")
    private String city;

    @NotBlank(message = "L'adresse de la boutique est obligatoire")
    private String shopAddress;

    // Lien "autre réseau social" générique (optionnel)
    private String socialLink;

    // Lien Instagram spécifique (optionnel)
    private String instagramLink;

    // URL de la photo uploadée via POST /api/upload/vendor-photo (optionnel)
    @Size(max = 500)
    private String photoUrl;

    private String bankAccountHolderName;

    private String bankName;

    @jakarta.validation.constraints.Pattern(regexp = "^\\d{24}$", message = "Le RIB doit contenir exactement 24 chiffres")
    private String bankRib;
}
