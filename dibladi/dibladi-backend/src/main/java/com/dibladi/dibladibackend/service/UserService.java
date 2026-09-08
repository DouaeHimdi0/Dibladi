package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.AuthRequest;
import com.dibladi.dibladibackend.dto.AuthResponse;
import com.dibladi.dibladibackend.dto.ClientRegisterRequest;
import com.dibladi.dibladibackend.dto.VendorRegisterRequest;
import com.dibladi.dibladibackend.entity.Client;
import com.dibladi.dibladibackend.entity.User;
import com.dibladi.dibladibackend.entity.VendorRequest;
import com.dibladi.dibladibackend.enums.UserRole;
import com.dibladi.dibladibackend.enums.VendorRequestStatus;
import com.dibladi.dibladibackend.repository.ClientRepository;
import com.dibladi.dibladibackend.repository.UserRepository;
import com.dibladi.dibladibackend.repository.VendorRequestRepository;
import com.dibladi.dibladibackend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final VendorRequestRepository vendorRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse authenticate(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public String registerClient(ClientRegisterRequest dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Un compte existe déjà avec cet email.");
        }

        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(UserRole.CLIENT)
                .build();

        User savedUser = userRepository.save(user);

        Client client = Client.builder()
                .user(savedUser)
                .firstName(dto.getFirstName() != null ? dto.getFirstName().trim() : "")
                .lastName(dto.getLastName() != null ? dto.getLastName().trim() : "")
                .phone(dto.getPhone() != null ? dto.getPhone().trim() : "")
                .build();

        clientRepository.save(client);
        return "Compte client créé avec succès.";
    }

    /**
     * Enregistre une demande d'inscription vendeur avec status PENDING.
     * Aucun compte User ni Vendor n'est créé à ce stade.
     * Le compte est créé lors de l'approbation par l'admin.
     *
     * @throws IllegalArgumentException si l'email est déjà utilisé
     */
    public String registerVendorRequest(VendorRegisterRequest dto) {
        // Vérification unicité : email déjà utilisé par un compte
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Un compte existe déjà avec cet email.");
        }
        // Vérification unicité : demande déjà en attente
        if (vendorRequestRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Une demande est déjà en cours de traitement pour cet email.");
        }

        VendorRequest request = VendorRequest.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .phone(dto.getPhone())
                .shopName(dto.getShopName())
                .city(dto.getCity())
                .shopAddress(dto.getShopAddress())
                .socialLink(dto.getSocialLink())
                .instagramLink(dto.getInstagramLink())
                .photoUrl(dto.getPhotoUrl())
                .bankAccountHolderName(dto.getBankAccountHolderName())
                .bankName(dto.getBankName())
                .bankRib(dto.getBankRib())
                .status(VendorRequestStatus.PENDING)
                .build();

        vendorRequestRepository.save(request);
        return "Votre demande a bien été enregistrée. Vous recevrez un email dès qu'elle aura été examinée par notre équipe.";
    }
}
