package com.police.backend.config;

import com.police.backend.entity.User;
import com.police.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // Create Police Head if not exists
        if (!userRepository.existsByUsername("ashu")) {
            User policeHead = new User();
            policeHead.setUsername("ashu");
            policeHead.setPassword(passwordEncoder.encode("Ashu19951?"));
            policeHead.setEmail("ashenafiabebe604@gmail.com");
            policeHead.setFullName("Ashenafi Abebe");
            policeHead.setRole("POLICE_HEAD");
            policeHead.setBadgeNumber("PH-001");
            policeHead.setStatus("ACTIVE");
            userRepository.save(policeHead);
            System.out.println("✅ Police Head created: ashu / Ashu19951?");
            System.out.println("   Name: Ashenafi Abebe");
            System.out.println("   Email: ashenafiabebe604@gmail.com");
        }
        
        // Create Detective if not exists
        if (!userRepository.existsByUsername("bire")) {
            User detective = new User();
            detective.setUsername("bire");
            detective.setPassword(passwordEncoder.encode("Ashu19951?"));
            detective.setEmail("bire@police.gov");
            detective.setFullName("Detective Bire");
            detective.setRole("DETECTIVE");
            detective.setBadgeNumber("DT-001");
            detective.setStatus("ACTIVE");
            userRepository.save(detective);
            System.out.println("✅ Detective created: bire / Ashu19951?");
        }
    }
}