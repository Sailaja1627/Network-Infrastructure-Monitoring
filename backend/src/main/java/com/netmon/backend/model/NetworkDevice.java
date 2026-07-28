package com.netmon.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entity representing a network device (such as a router, switch, firewall, or server)
 * monitored by the system.
 */
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "network_devices", indexes = {
    @Index(name = "idx_device_name", columnList = "name"),
    @Index(name = "idx_device_ip", columnList = "ipAddress", unique = true),
    @Index(name = "idx_device_status", columnList = "status")
})
public class NetworkDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Device name is required")
    @Size(min = 2, max = 100, message = "Device name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "IP address is required")
    @Pattern(
        regexp = "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$",
        message = "Must be a valid IPv4 address (e.g. 192.168.1.1)"
    )
    @Column(nullable = false, unique = true)
    private String ipAddress;

    @NotNull(message = "Device type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceType type;

    @NotNull(message = "Device status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceStatus status;

    @Min(value = 0, message = "CPU usage cannot be negative")
    @Max(value = 100, message = "CPU usage cannot exceed 100%")
    private Double cpuUsage;

    @Min(value = 0, message = "Memory usage cannot be negative")
    @Max(value = 100, message = "Memory usage cannot exceed 100%")
    private Double memoryUsage;

    @Min(value = 0, message = "Latency cannot be negative")
    private Double latencyMs;

    @Min(value = 0, message = "Packet loss cannot be negative")
    @Max(value = 100, message = "Packet loss cannot exceed 100%")
    private Double packetLoss;

    private LocalDateTime lastUpdated;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Default constructor required by JPA.
     */
    public NetworkDevice() {
    }

    /**
     * Constructor for generating seeded or new devices.
     *
     * @param name        the user-facing display name
     * @param ipAddress   the target IPv4 address
     * @param type        the hardware category
     * @param status      the initial health state
     * @param cpuUsage    current cpu usage percentage
     * @param memoryUsage current memory usage percentage
     * @param latencyMs   current response time in milliseconds
     * @param packetLoss  current packet loss percentage
     */
    public NetworkDevice(String name, String ipAddress, DeviceType type, DeviceStatus status,
                         Double cpuUsage, Double memoryUsage, Double latencyMs, Double packetLoss) {
        this.name = name;
        this.ipAddress = ipAddress;
        this.type = type;
        this.status = status;
        this.cpuUsage = cpuUsage;
        this.memoryUsage = memoryUsage;
        this.latencyMs = latencyMs;
        this.packetLoss = packetLoss;
        this.lastUpdated = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public DeviceType getType() {
        return type;
    }

    public void setType(DeviceType type) {
        this.type = type;
    }

    public DeviceStatus getStatus() {
        return status;
    }

    public void setStatus(DeviceStatus status) {
        this.status = status;
    }

    public Double getCpuUsage() {
        return cpuUsage;
    }

    public void setCpuUsage(Double cpuUsage) {
        this.cpuUsage = cpuUsage;
    }

    public Double getMemoryUsage() {
        return memoryUsage;
    }

    public void setMemoryUsage(Double memoryUsage) {
        this.memoryUsage = memoryUsage;
    }

    public Double getLatencyMs() {
        return latencyMs;
    }

    public void setLatencyMs(Double latencyMs) {
        this.latencyMs = latencyMs;
    }

    public Double getPacketLoss() {
        return packetLoss;
    }

    public void setPacketLoss(Double packetLoss) {
        this.packetLoss = packetLoss;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
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
