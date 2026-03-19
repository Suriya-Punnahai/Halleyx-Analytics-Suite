package com.halleyx.dashboard.repository;

import com.halleyx.dashboard.model.DashboardLayout;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DashboardLayoutRepository extends JpaRepository<DashboardLayout, Long> {
    Optional<DashboardLayout> findByName(String name);
}
