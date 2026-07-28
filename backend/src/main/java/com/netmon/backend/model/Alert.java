package com.netmon.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entity representing an active or historical system alert triggered by network anomalies
 * (such as high load, packet loss, or device offline states).
 */
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "alerts", indexes = {
    @Index(name = "idx_alert_device_id", columnList = "deviceId"),
    @Index(name = "idx_alert_severity", columnList = "severity"),
    @Index(name = "idx_alert_resolved", columnList = "resolved")
})
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Associated device ID is required")
    @Column(nullable = false)
    private Long deviceId;

    @NotBlank(message = "Associated device name is required")
    @Size(max = 100)
    @Column(nullable = false)
    private String deviceName;

    @NotNull(message = "Alert severity is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertSeverity severity;

    @NotBlank(message = "Alert message description is required")
    @Size(max = 255)
    @Column(nullable = false)
    private String message;

    @NotNull(message = "Alert timestamp is required")
    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private boolean resolved;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Default constructor required by JPA.
     */
    public Alert() {
    }

    /**
     * Constructor for generating new alert occurrences.
     *
     * @param deviceId   id of the target NetworkDevice
     * @param deviceName name of the target NetworkDevice
     * @param severity   urgency level of this alert
     * @param message    human-readable anomaly description
     */
    public Alert(Long deviceId, String deviceName, AlertSeverity severity, String message) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.severity = severity;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.resolved = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(Long deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public AlertSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(AlertSeverity severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isResolved() {
        return resolved;
    }

    public void setResolved(boolean resolved) {
        this.resolved = resolved;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
