package com.netmon.backend.controller;

import com.netmon.backend.dto.ApiResponse;
import com.netmon.backend.dto.DeviceDto;
import com.netmon.backend.service.DeviceService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing monitored network devices.
 * Provides endpoints for creating, retrieving, updating, and deleting nodes.
 * Includes SLF4J traffic auditing loggers.
 */
@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private static final Logger log = LoggerFactory.getLogger(DeviceController.class);
    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    /**
     * Retrieves a list of all monitored devices currently registered in the database.
     *
     * @return the list of devices inside a standard ApiResponse envelope
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceDto>>> getAllDevices() {
        log.info("REST request to retrieve all network devices");
        List<DeviceDto> devices = deviceService.getAllDevices();
        return ResponseEntity.ok(ApiResponse.success(devices, "Devices retrieved successfully"));
    }

    /**
     * Retrieves specific details of a single device by its primary key.
     *
     * @param id the device database identifier
     * @return the device DTO inside an ApiResponse envelope
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeviceDto>> getDeviceById(@PathVariable Long id) {
        log.info("REST request to fetch device with ID: {}", id);
        DeviceDto device = deviceService.getDeviceById(id);
        return ResponseEntity.ok(ApiResponse.success(device, "Device details retrieved successfully"));
    }

    /**
     * Registers a new network node in the system.
     * The input payload is validated to ensure name length and IP formatting are correct.
     *
     * @param dto registration payload
     * @return the registered device details inside an ApiResponse envelope
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DeviceDto>> createDevice(@Valid @RequestBody DeviceDto dto) {
        log.info("REST request to register new device: {} with IP: {}", dto.getName(), dto.getIpAddress());
        DeviceDto created = deviceService.createDevice(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Device registered successfully"));
    }

    /**
     * Modifies the configuration properties (Name, IP, Type) of an active network device.
     *
     * @param id  the target device identifier
     * @param dto the update payload containing properties to merge
     * @return the updated device details inside an ApiResponse envelope
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DeviceDto>> updateDevice(@PathVariable Long id, @Valid @RequestBody DeviceDto dto) {
        log.info("REST request to update device settings with ID: {} name: {}", id, dto.getName());
        DeviceDto updated = deviceService.updateDevice(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Device configuration updated successfully"));
    }

    /**
     * Deregisters and deletes a network node from system mapping and database records.
     *
     * @param id the target device identifier
     * @return an empty ApiResponse envelope confirming successful removal
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDevice(@PathVariable Long id) {
        log.info("REST request to deregister device with ID: {}", id);
        deviceService.deleteDevice(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Device deregistered successfully"));
    }
}
