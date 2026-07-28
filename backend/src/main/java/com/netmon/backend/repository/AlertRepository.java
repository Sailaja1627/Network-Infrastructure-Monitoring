package com.netmon.backend.repository;

import com.netmon.backend.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByResolvedFalseOrderByTimestampDesc();
    List<Alert> findAllByOrderByTimestampDesc();
}
