package com.netmon.backend.mapper;

import com.netmon.backend.dto.AlertDto;
import com.netmon.backend.dto.DeviceDto;
import com.netmon.backend.model.*;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Mapper class responsible for converting JPA database entities to client-facing DTOs
 * and converting incoming client DTOs back to database entities.
 */
@Component
public class DtoMapper {

    /**
     * Converts a NetworkDevice entity to its corresponding DeviceDto representation.
     *
     * @param device the source database entity
     * @return the mapped DeviceDto
     */
    public DeviceDto toDeviceDto(NetworkDevice device) {
        if (device == null) {
            return null;
        }

        DeviceDto dto = new DeviceDto();
        dto.setId(device.getId());
        dto.setName(device.getName());
        dto.setIpAddress(device.getIpAddress());
        dto.setType(device.getType().name());
        dto.setStatus(device.getStatus().name());
        dto.setCpuUsage(device.getCpuUsage());
        dto.setMemoryUsage(device.getMemoryUsage());
        dto.setLatencyMs(device.getLatencyMs());
        dto.setPacketLoss(device.getPacketLoss());
        dto.setLastUpdated(device.getLastUpdated());

        return dto;
    }

    /**
     * Converts a DeviceDto payload into a fresh or updated NetworkDevice entity.
     *
     * @param dto the source DTO
     * @return the mapped NetworkDevice entity
     */
    public NetworkDevice toDeviceEntity(DeviceDto dto) {
        if (dto == null) {
            return null;
        }

        NetworkDevice device = new NetworkDevice();
        device.setId(dto.getId());
        device.setName(dto.getName());
        device.setIpAddress(dto.getIpAddress());
        device.setType(DeviceType.valueOf(dto.getType().toUpperCase()));
        
        if (dto.getStatus() != null) {
            device.setStatus(DeviceStatus.valueOf(dto.getStatus().toUpperCase()));
        } else {
            device.setStatus(DeviceStatus.ONLINE);
        }

        device.setCpuUsage(dto.getCpuUsage() != null ? dto.getCpuUsage() : 0.0);
        device.setMemoryUsage(dto.getMemoryUsage() != null ? dto.getMemoryUsage() : 0.0);
        device.setLatencyMs(dto.getLatencyMs() != null ? dto.getLatencyMs() : 0.0);
        device.setPacketLoss(dto.getPacketLoss() != null ? dto.getPacketLoss() : 0.0);
        device.setLastUpdated(LocalDateTime.now());

        return device;
    }

    /**
     * Converts an Alert entity to its corresponding AlertDto representation.
     *
     * @param alert the source database alert
     * @return the mapped AlertDto
     */
    public AlertDto toAlertDto(Alert alert) {
        if (alert == null) {
            return null;
        }

        AlertDto dto = new AlertDto();
        dto.setId(alert.getId());
        dto.setDeviceId(alert.getDeviceId());
        dto.setDeviceName(alert.getDeviceName());
        dto.setSeverity(alert.getSeverity().name());
        dto.setMessage(alert.getMessage());
        dto.setTimestamp(alert.getTimestamp());
        dto.setResolved(alert.isResolved());

        return dto;
    }

    /**
     * Converts an AlertDto back into an Alert database entity.
     *
     * @param dto the source DTO
     * @return the mapped Alert entity
     */
    public Alert toAlertEntity(AlertDto dto) {
        if (dto == null) {
            return null;
        }

        Alert alert = new Alert();
        alert.setId(dto.getId());
        alert.setDeviceId(dto.getDeviceId());
        alert.setDeviceName(dto.getDeviceName());
        alert.setSeverity(AlertSeverity.valueOf(dto.getSeverity().toUpperCase()));
        alert.setMessage(dto.getMessage());
        alert.setTimestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now());
        alert.setResolved(dto.isResolved());

        return alert;
    }
}
