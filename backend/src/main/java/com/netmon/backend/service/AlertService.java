package com.netmon.backend.service;

import com.netmon.backend.dto.AlertDto;
import com.netmon.backend.exception.ResourceNotFoundException;
import com.netmon.backend.mapper.DtoMapper;
import com.netmon.backend.model.Alert;
import com.netmon.backend.model.AlertSeverity;
import com.netmon.backend.repository.AlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing alerts, logs, and notification streams.
 */
@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final DtoMapper dtoMapper;
    private final SseService sseService;

    public AlertService(AlertRepository alertRepository, DtoMapper dtoMapper, SseService sseService) {
        this.alertRepository = alertRepository;
        this.dtoMapper = dtoMapper;
        this.sseService = sseService;
    }

    /**
     * Gets all active (unresolved) alerts, ordered by most recent first.
     *
     * @return list of AlertDto
     */
    @Transactional(readOnly = true)
    public List<AlertDto> getUnresolvedAlerts() {
        return alertRepository.findByResolvedFalseOrderByTimestampDesc().stream()
                .map(dtoMapper::toAlertDto)
                .collect(Collectors.toList());
    }

    /**
     * Gets a complete historical list of all alerts.
     *
     * @return list of AlertDto
     */
    @Transactional(readOnly = true)
    public List<AlertDto> getAllAlerts() {
        return alertRepository.findAllByOrderByTimestampDesc().stream()
                .map(dtoMapper::toAlertDto)
                .collect(Collectors.toList());
    }

    /**
     * Acknowledges and resolves a specific active alert.
     *
     * @param id the alert database identifier
     * @return the updated alert DTO
     * @throws ResourceNotFoundException if the alert ID is invalid
     */
    @Transactional
    public AlertDto resolveAlert(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with ID: " + id));

        alert.setResolved(true);
        alert.setTimestamp(LocalDateTime.now()); // Update timestamp to resolution time
        Alert resolvedAlert = alertRepository.save(alert);
        AlertDto response = dtoMapper.toAlertDto(resolvedAlert);

        // Notify client interfaces to remove this alert from the warning banner or list
        sseService.broadcast("ALERT_RESOLVED", response);
        return response;
    }

    /**
     * Internally logs and broadcasts a fresh alert event.
     *
     * @param deviceId   target network device
     * @param deviceName target network device display name
     * @param severity   urgency class
     * @param message    description of the anomaly
     * @return the logged AlertDto details
     */
    @Transactional
    public AlertDto createAlert(Long deviceId, String deviceName, AlertSeverity severity, String message) {
        Alert alert = new Alert(deviceId, deviceName, severity, message);
        Alert saved = alertRepository.save(alert);
        AlertDto response = dtoMapper.toAlertDto(saved);

        // Broadcast the alert to client screens immediately
        sseService.broadcast("ALERT_TRIGGERED", response);
        return response;
    }
}
