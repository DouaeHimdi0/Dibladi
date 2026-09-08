package com.dibladi.dibladibackend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateBCryptHashMain {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String plainPassword = "suppdibladi";
        String hash = encoder.encode(plainPassword);
        System.out.println("BCrypt hash for suppdibladi: " + hash);
    }
}
