package com.invoiceiq.backend;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;


        @CrossOrigin(origins = {
                "http://localhost:5173",
                "http://localhost:5174",
                "https://invoiceiq-backend-zjma.onrender.com",
                "https://invoice-kciudzdy9-raghav-s-projects10.vercel.app"
        })
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceRepository repo;
    private final UserRepository userRepo;
    private final ClientRepository clientRepo;
    private final EmailService emailService;

    private User getUser(Authentication auth) {
        return userRepo.findByEmail(auth.getName()).orElseThrow();
    }

    @GetMapping
    public List<Invoice> getAll(Authentication auth) {
        return repo.findByUserId(getUser(auth).getId());
    }

    @PostMapping
    public Invoice create(@Valid @RequestBody InvoiceRequest req, Authentication auth) {
        User user = getUser(auth);
        Invoice invoice = new Invoice();
        invoice.setClientName(req.getClientName());
        invoice.setClientEmail(req.getClientEmail());
        invoice.setAmount(req.getAmount());
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(req.getDueDate());
        invoice.setStatus(req.getDueDate().isBefore(LocalDate.now()) ? "OVERDUE" : "PENDING");
        invoice.setInvoiceCode(InvoiceUtils.generateCode());
        if (req.getClientId() != null) {
            clientRepo.findById(req.getClientId()).ifPresent(c -> {
                invoice.setClient(c);
                invoice.setClientName(c.getName());
                invoice.setClientEmail(c.getEmail());
            });
        }
        invoice.setUser(user);
        return repo.save(invoice);
    }

    @PatchMapping("/{id}/pay")
    public Invoice pay(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        Invoice invoice = repo.findById(id).orElseThrow();
        if (!invoice.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        invoice.setStatus("PAID");
        return repo.save(invoice);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<?> sendFollowUp(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {

        User user = getUser(auth);
        Invoice invoice = repo.findById(id).orElseThrow();

        if (!invoice.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }

        String draft = body.get("draft");
        String subject = "Payment Reminder — " + invoice.getInvoiceCode();

        emailService.sendEmail(invoice.getClientEmail(), subject, draft);

        invoice.setLastContactedAt(LocalDateTime.now());
        repo.save(invoice);
        return ResponseEntity.ok(Map.of("message", "Email sent successfully"));
    }
}