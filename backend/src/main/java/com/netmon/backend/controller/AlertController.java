package com.netmon.backend.controller;

import com.netmon.backend.dto.AlertDto;
import com.netmon.backend.dto.ApiResponse;
import com.netmon.backend.service.AlertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for browsing and resolving system alerts.
 * Includes SLF4J traffic auditing loggers.
 */
@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private static final Logger log = LoggerFactory.getLogger(AlertController.class);
    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    /**
     * Retrieves all active, unresolved alerts (warnings/critical anomalies).
     *
     * @return the list of active alerts inside a standard ApiResponse envelope
     */
    @GetMapping("/unresolved")
    public ResponseEntity<ApiResponse<List<AlertDto>>> getUnresolvedAlerts() {
        log.info("REST request to fetch active/unresolved incidents list");
        List<AlertDto> alerts = alertService.getUnresolvedAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts, "Unresolved alerts retrieved successfully"));
    }

    /**
     * Retrieves a complete historical log of all alerts (both active and resolved).
     *
     * @return the complete history of alerts inside an ApiResponse envelope
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AlertDto>>> getAllAlerts() {
        log.info("REST request to fetch complete alert logs history");
        List<AlertDto> alerts = alertService.getAllAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts, "All alerts retrieved successfully"));
    }

    /**
     * Acknowledges and resolves a specific active alert, marking it as resolved in the DB.
     *
     * @param id the alert database identifier
     * @return the resolved alert details inside an ApiResponse envelope
     */
    @PostMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<AlertDto>> resolveAlert(@PathVariable Long id) {
        log.info("REST request to acknowledge/resolve incident ticket with ID: {}", id);
        AlertDto resolved = alertService.resolveAlert(id);
        return ResponseEntity.ok(ApiResponse.success(resolved, "Alert acknowledged and resolved successfully"));
    }
}
