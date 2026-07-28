package com.netmon.backend.service;

import com.netmon.backend.dto.DeviceDto;
import com.netmon.backend.exception.ResourceNotFoundException;
import com.netmon.backend.mapper.DtoMapper;
import com.netmon.backend.model.DeviceStatus;
import com.netmon.backend.model.DeviceType;
import com.netmon.backend.model.NetworkDevice;
import com.netmon.backend.repository.NetworkDeviceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing network device operations (CRUD operations, mapping, and database integration).
 */
@Service
public class DeviceService {

    private final NetworkDeviceRepository deviceRepository;
    private final DtoMapper dtoMapper;
    private final SseService sseService;

    public DeviceService(NetworkDeviceRepository deviceRepository, DtoMapper dtoMapper, SseService sseService) {
        this.deviceRepository = deviceRepository;
        this.dtoMapper = dtoMapper;
        this.sseService = sseService;
    }

    /**
     * Fetches all registered network devices.
     *
     * @return list of DeviceDto representations
     */
    @Transactional(readOnly = true)
    public List<DeviceDto> getAllDevices() {
        return deviceRepository.findAll().stream()
                .map(dtoMapper::toDeviceDto)
                .collect(Collectors.toList());
    }

    /**
     * Finds a specific device by its auto-generated ID.
     *
     * @param id the target identifier
     * @return the device DTO
     * @throws ResourceNotFoundException if the ID is invalid
     */
    @Transactional(readOnly = true)
    public DeviceDto getDeviceById(Long id) {
        NetworkDevice device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with ID: " + id));
        return dtoMapper.toDeviceDto(device);
    }

    /**
     * Creates and registers a new network device.
     *
     * @param dto registration payload
     * @return registered device details
     */
    @Transactional
    public DeviceDto createDevice(DeviceDto dto) {
        NetworkDevice device = dtoMapper.toDeviceEntity(dto);
        // Default statistics for a brand new node
        device.setStatus(DeviceStatus.ONLINE);
        device.setCpuUsage(0.0);
        device.setMemoryUsage(0.0);
        device.setLatencyMs(0.0);
        device.setPacketLoss(0.0);
        device.setLastUpdated(LocalDateTime.now());

        NetworkDevice saved = deviceRepository.save(device);
        DeviceDto response = dtoMapper.toDeviceDto(saved);

        // Broadcast node addition to active clients
        sseService.broadcast("DEVICE_ADDED", response);
        return response;
    }

    /**
     * Updates an existing device's details (e.g. name, type, IP).
     *
     * @param id  target device identifier
     * @param dto update payload
     * @return updated device details
     */
    @Transactional
    public DeviceDto updateDevice(Long id, DeviceDto dto) {
        NetworkDevice device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with ID: " + id));

        device.setName(dto.getName());
        device.setIpAddress(dto.getIpAddress());
        device.setType(DeviceType.valueOf(dto.getType().toUpperCase()));
        device.setLastUpdated(LocalDateTime.now());

        NetworkDevice updated = deviceRepository.save(device);
        DeviceDto response = dtoMapper.toDeviceDto(updated);

        // Broadcast update to client interface
        sseService.broadcast("DEVICE_UPDATED", response);
        return response;
    }

    /**
     * Deregisters and deletes a device from the system.
     *
     * @param id target device identifier
     */
    @Transactional
    public void deleteDevice(Long id) {
        NetworkDevice device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with ID: " + id));
        
        deviceRepository.delete(device);
        
        // Notify client interfaces to remove the device from visual layouts
        sseService.broadcast("DEVICE_DELETED", id);
    }
}
