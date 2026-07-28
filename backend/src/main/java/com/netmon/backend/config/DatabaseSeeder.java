package com.netmon.backend.config;

import com.netmon.backend.model.*;
import com.netmon.backend.repository.AlertRepository;
import com.netmon.backend.repository.NetworkDeviceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final NetworkDeviceRepository deviceRepository;
    private final AlertRepository alertRepository;

    public DatabaseSeeder(NetworkDeviceRepository deviceRepository, AlertRepository alertRepository) {
        this.deviceRepository = deviceRepository;
        this.alertRepository = alertRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (deviceRepository.count() == 0) {
            seedDevices();
        }
    }

    private void seedDevices() {
        // Create realistic devices representing an enterprise infrastructure
        NetworkDevice router = new NetworkDevice(
                "Gateway Router", "192.168.1.1", DeviceType.ROUTER, DeviceStatus.ONLINE,
                12.4, 25.8, 4.2, 0.0
        );

        NetworkDevice firewall = new NetworkDevice(
                "Corporate Firewall", "192.168.1.2", DeviceType.FIREWALL, DeviceStatus.ONLINE,
                24.1, 41.5, 5.1, 0.0
        );

        NetworkDevice coreSwitch = new NetworkDevice(
                "Core Switch", "192.168.1.10", DeviceType.SWITCH, DeviceStatus.ONLINE,
                8.3, 19.4, 1.8, 0.0
        );

        NetworkDevice webServer = new NetworkDevice(
                "Web Server Primary", "192.168.1.50", DeviceType.SERVER, DeviceStatus.ONLINE,
                45.2, 60.1, 8.5, 0.0
        );

        NetworkDevice dbServer = new NetworkDevice(
                "Database Server", "192.168.1.60", DeviceType.SERVER, DeviceStatus.ONLINE,
                55.7, 72.3, 11.2, 0.0
        );

        NetworkDevice mailServer = new NetworkDevice(
                "Mail Server", "192.168.1.70", DeviceType.SERVER, DeviceStatus.WARNING,
                88.5, 84.1, 45.2, 1.2
        );

        NetworkDevice apOffice1 = new NetworkDevice(
                "Office AP East", "192.168.2.100", DeviceType.WIRELESS_AP, DeviceStatus.ONLINE,
                15.6, 32.0, 15.1, 0.0
        );

        NetworkDevice apOffice2 = new NetworkDevice(
                "Office AP West", "192.168.2.101", DeviceType.WIRELESS_AP, DeviceStatus.OFFLINE,
                0.0, 0.0, 0.0, 100.0
        );

        // Save devices to H2 database
        List<NetworkDevice> devices = deviceRepository.saveAll(Arrays.asList(
                router, firewall, coreSwitch, webServer, dbServer, mailServer, apOffice1, apOffice2
        ));

        // Retrieve saved references to link IDs
        NetworkDevice savedMailServer = devices.stream()
                .filter(d -> d.getName().equals("Mail Server")).findFirst().orElse(mailServer);
        NetworkDevice savedApOffice2 = devices.stream()
                .filter(d -> d.getName().equals("Office AP West")).findFirst().orElse(apOffice2);

        // Seed initial unresolved alerts matching their status
        alertRepository.save(new Alert(
                savedMailServer.getId(), savedMailServer.getName(), AlertSeverity.WARNING,
                "High CPU usage warning: current usage is " + savedMailServer.getCpuUsage() + "% (Threshold: 85%)"
        ));

        alertRepository.save(new Alert(
                savedApOffice2.getId(), savedApOffice2.getName(), AlertSeverity.CRITICAL,
                "Device offline: High packet loss (100.0%) detected on IP " + savedApOffice2.getIpAddress()
        ));
    }
}
