package com.invoiceiq.backend;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String toEmail, String subject, String draft) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("invoiceiq2026@gmail.com");
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(draft);
        mailSender.send(message);
    }
}