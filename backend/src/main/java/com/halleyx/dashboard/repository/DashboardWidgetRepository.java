package com.halleyx.dashboard.repository;

import com.halleyx.dashboard.model.DashboardWidget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DashboardWidgetRepository extends JpaRepository<DashboardWidget, Long> {
}
