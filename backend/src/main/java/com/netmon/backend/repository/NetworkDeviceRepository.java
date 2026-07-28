package com.netmon.backend.repository;

import com.netmon.backend.model.NetworkDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NetworkDeviceRepository extends JpaRepository<NetworkDevice, Long> {
}
