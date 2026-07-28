package com.netmon.backend.service;

import com.netmon.backend.dto.DeviceDto;
import com.netmon.backend.mapper.DtoMapper;
import com.netmon.backend.model.*;
import com.netmon.backend.repository.AlertRepository;
import com.netmon.backend.repository.NetworkDeviceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

/**
 * Background monitoring engine simulating real-time network traffic and hardware statistics.
 * Periodic updates are saved and pushed via Server-Sent Events (SSE).
 */
@Service
public class DeviceMonitoringService {

    private static final Logger log = LoggerFactory.getLogger(DeviceMonitoringService.class);
    private final NetworkDeviceRepository deviceRepository;
    private final AlertRepository alertRepository;
    private final AlertService alertService;
    private final SseService sseService;
    private final DtoMapper dtoMapper;
    private final Random random = new Random();

    public DeviceMonitoringService(NetworkDeviceRepository deviceRepository,
                                   AlertRepository alertRepository,
                                   AlertService alertService,
                                   SseService sseService,
                                   DtoMapper dtoMapper) {
        this.deviceRepository = deviceRepository;
        this.alertRepository = alertRepository;
        this.alertService = alertService;
        this.sseService = sseService;
        this.dtoMapper = dtoMapper;
    }

    /**
     * Periodic background execution (every 3 seconds) to simulate active ping probes
     * and agent telemetry data pulls across all registered devices.
     */
    @Scheduled(fixedRate = 3000)
    @Transactional
    public void monitorInfrastructure() {
        List<NetworkDevice> devices = deviceRepository.findAll();
        if (devices.isEmpty()) {
            return;
        }

        List<Alert> unresolvedAlerts = alertRepository.findByResolvedFalseOrderByTimestampDesc();

        for (NetworkDevice device : devices) {
            if (device.getStatus() == DeviceStatus.OFFLINE) {
                // 8% chance that an offline device is repaired and comes back online
                if (random.nextDouble() < 0.08) {
                    recoverDevice(device, unresolvedAlerts);
                }
            } else {
                // Device is ONLINE or WARNING - simulate active state
                updateActiveDeviceMetrics(device, unresolvedAlerts);
            }
        }
    }

    private void recoverDevice(NetworkDevice device, List<Alert> unresolvedAlerts) {
        device.setStatus(DeviceStatus.ONLINE);
        device.setCpuUsage(10.0 + random.nextDouble() * 15.0);
        device.setMemoryUsage(20.0 + random.nextDouble() * 20.0);
        device.setLatencyMs(5.0 + random.nextDouble() * 15.0);
        device.setPacketLoss(0.0);
        device.setLastUpdated(LocalDateTime.now());
        deviceRepository.save(device);

        // Resolve any critical alerts for this device
        unresolvedAlerts.stream()
                .filter(a -> a.getDeviceId().equals(device.getId()) && a.getSeverity() == AlertSeverity.CRITICAL)
                .forEach(a -> alertService.resolveAlert(a.getId()));

        alertService.createAlert(device.getId(), device.getName(), AlertSeverity.INFO,
                "Device connectivity restored. Node returned online on IP: " + device.getIpAddress());

        DeviceDto dto = dtoMapper.toDeviceDto(device);
        sseService.broadcast("DEVICE_METRICS_UPDATED", dto);
        log.info("Device {} recovered and returned ONLINE", device.getName());
    }

    private void updateActiveDeviceMetrics(NetworkDevice device, List<Alert> unresolvedAlerts) {
        // Randomly simulate connection drop (1.5% chance)
        if (random.nextDouble() < 0.015 && !device.getName().contains("Gateway")) {
            simulateDeviceFailure(device);
            return;
        }

        // Fluctuate stats
        double cpuDelta = (random.nextDouble() - 0.5) * 8.0; // +/- 4%
        double newCpu = Math.max(5.0, Math.min(100.0, device.getCpuUsage() + cpuDelta));
        device.setCpuUsage(Math.round(newCpu * 10.0) / 10.0);

        double memDelta = (random.nextDouble() - 0.5) * 4.0; // +/- 2%
        double newMem = Math.max(10.0, Math.min(95.0, device.getMemoryUsage() + memDelta));
        device.setMemoryUsage(Math.round(newMem * 10.0) / 10.0);

        double latDelta = (random.nextDouble() - 0.5) * 6.0; // +/- 3ms
        double newLat = Math.max(1.0, Math.min(300.0, device.getLatencyMs() + latDelta));
        device.setLatencyMs(Math.round(newLat * 10.0) / 10.0);

        // Packet loss: 3% chance of brief congestion spikes
        if (random.nextDouble() < 0.03) {
            device.setPacketLoss(Math.round((1.0 + random.nextDouble() * 8.0) * 10.0) / 10.0);
        } else {
            device.setPacketLoss(0.0);
        }

        device.setLastUpdated(LocalDateTime.now());

        // Threshold checks
        boolean thresholdViolated = evaluateThresholds(device, unresolvedAlerts);

        if (!thresholdViolated) {
            // Check if warning statuses can be cleared back to healthy
            if (device.getStatus() == DeviceStatus.WARNING) {
                device.setStatus(DeviceStatus.ONLINE);
                log.info("Device {} warning cleared. Health is optimal.", device.getName());
            }
        }

        deviceRepository.save(device);

        DeviceDto dto = dtoMapper.toDeviceDto(device);
        sseService.broadcast("DEVICE_METRICS_UPDATED", dto);
    }

    private void simulateDeviceFailure(NetworkDevice device) {
        device.setStatus(DeviceStatus.OFFLINE);
        device.setCpuUsage(0.0);
        device.setMemoryUsage(0.0);
        device.setLatencyMs(0.0);
        device.setPacketLoss(100.0);
        device.setLastUpdated(LocalDateTime.now());
        deviceRepository.save(device);

        // Generate critical alert
        alertService.createAlert(device.getId(), device.getName(), AlertSeverity.CRITICAL,
                "Device offline: Ping timeout (100.0% packet loss) on IP " + device.getIpAddress());

        DeviceDto dto = dtoMapper.toDeviceDto(device);
        sseService.broadcast("DEVICE_METRICS_UPDATED", dto);
        log.warn("Device {} has dropped OFFLINE", device.getName());
    }

    private boolean evaluateThresholds(NetworkDevice device, List<Alert> unresolvedAlerts) {
        boolean warningOrCritical = false;

        // CPU threshold: > 85%
        if (device.getCpuUsage() > 85.0) {
            warningOrCritical = true;
            device.setStatus(DeviceStatus.WARNING);

            boolean alreadyAlerted = unresolvedAlerts.stream()
                    .anyMatch(a -> a.getDeviceId().equals(device.getId()) && a.getMessage().contains("High CPU"));

            if (!alreadyAlerted) {
                alertService.createAlert(device.getId(), device.getName(), AlertSeverity.WARNING,
                        "High CPU load warning: current load is " + device.getCpuUsage() + "% (Threshold: 85.0%)");
            }
        } else {
            // Auto-resolve CPU alerts if CPU has returned below limit
            unresolvedAlerts.stream()
                    .filter(a -> a.getDeviceId().equals(device.getId()) && a.getMessage().contains("High CPU"))
                    .forEach(a -> alertService.resolveAlert(a.getId()));
        }

        // Latency threshold: > 150ms
        if (device.getLatencyMs() > 150.0) {
            warningOrCritical = true;
            device.setStatus(DeviceStatus.WARNING);

            boolean alreadyAlerted = unresolvedAlerts.stream()
                    .anyMatch(a -> a.getDeviceId().equals(device.getId()) && a.getMessage().contains("High Latency"));

            if (!alreadyAlerted) {
                alertService.createAlert(device.getId(), device.getName(), AlertSeverity.WARNING,
                        "High Latency threshold exceeded: current latency is " + device.getLatencyMs() + "ms (Threshold: 150.0ms)");
            }
        } else {
            // Auto-resolve Latency alerts
            unresolvedAlerts.stream()
                    .filter(a -> a.getDeviceId().equals(device.getId()) && a.getMessage().contains("High Latency"))
                    .forEach(a -> alertService.resolveAlert(a.getId()));
        }

        // Packet Loss threshold: > 5%
        if (device.getPacketLoss() > 5.0 && device.getPacketLoss() < 100.0) {
            warningOrCritical = true;
            device.setStatus(DeviceStatus.WARNING);

            boolean alreadyAlerted = unresolvedAlerts.stream()
                    .anyMatch(a -> a.getDeviceId().equals(device.getId()) && a.getMessage().contains("Packet Loss"));

            if (!alreadyAlerted) {
                alertService.createAlert(device.getId(), device.getName(), AlertSeverity.WARNING,
                        "Packet Loss warning: current loss is " + device.getPacketLoss() + "% (Threshold: 5.0%)");
            }
        } else if (device.getPacketLoss() == 0.0) {
            // Auto-resolve Packet Loss alerts
            unresolvedAlerts.stream()
                    .filter(a -> a.getDeviceId().equals(device.getId()) && a.getMessage().contains("Packet Loss"))
                    .forEach(a -> alertService.resolveAlert(a.getId()));
        }

        return warningOrCritical;
    }
}
