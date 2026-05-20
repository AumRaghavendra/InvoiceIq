package com.invoiceiq.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientRepository clientRepo;
    private final UserRepository userRepo;

    private User getUser(Authentication auth) {
        return userRepo.findByEmail(auth.getName()).orElseThrow();
    }

    @GetMapping
    public List<Client> getAll(Authentication auth) {
        return clientRepo.findByUserId(getUser(auth).getId());
    }

    @PostMapping
    public Client create(@RequestBody Map<String, String> body, Authentication auth) {
        User user = getUser(auth);
        Client client = new Client();
        client.setName(body.get("name"));
        client.setCompany(body.get("company"));
        client.setEmail(body.get("email"));
        client.setPhone(body.get("phone"));
        client.setUser(user);
        return clientRepo.save(client);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        Client client = clientRepo.findById(id).orElseThrow();
        if (!client.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        clientRepo.deleteById(id);
    }
}