package com.invoiceiq.backend;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;

@Entity
@Data
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientName;
    private String clientEmail;
    private Double amount;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private String status;
    @Column(unique = true)
    private String invoiceCode;
    private java.time.LocalDateTime lastContactedAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonIgnore
    private Client client;

    public String getRiskLevel() {
        if (status.equals("PAID")) return "GREEN";
        long daysOverdue = LocalDate.now().toEpochDay() - dueDate.toEpochDay();
        if (daysOverdue <= 0) return "GREEN";
        if (daysOverdue <= 14) return "YELLOW";
        return "RED";
    }
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}