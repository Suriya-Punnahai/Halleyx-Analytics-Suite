package com.halleyx.dashboard.service;

import com.halleyx.dashboard.model.DashboardLayout;
import com.halleyx.dashboard.model.DashboardWidget;
import com.halleyx.dashboard.repository.DashboardLayoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DashboardLayoutService {

    @Autowired
    private DashboardLayoutRepository repository;

    public DashboardLayout getDashboard(String name) {
        return repository.findByName(name).orElse(new DashboardLayout());
    }

    public DashboardLayout saveDashboard(DashboardLayout layout) {
        String layoutName = (layout.getName() != null) ? layout.getName() : "default";
        Optional<DashboardLayout> existingLayoutOpt = repository.findByName(layoutName);
        
        DashboardLayout layoutToSave;
        if (existingLayoutOpt.isPresent()) {
            layoutToSave = existingLayoutOpt.get();
        } else {
            layoutToSave = new DashboardLayout();
            layoutToSave.setName(layoutName);
        }

        layoutToSave.setLayoutConfig(layout.getLayoutConfig());
        
        // Clear all widgets and repopulate them correctly with bidirectional links
        if (layoutToSave.getWidgets() != null) {
            layoutToSave.getWidgets().clear();
        } else {
            layoutToSave.setWidgets(new java.util.ArrayList<>());
        }

        if (layout.getWidgets() != null) {
            for (DashboardWidget w : layout.getWidgets()) {
                DashboardWidget newW = new DashboardWidget();
                newW.setWidgetType(w.getWidgetType());
                newW.setTitle(w.getTitle());
                newW.setConfiguration(w.getConfiguration());
                newW.setLayout(layoutToSave);
                layoutToSave.getWidgets().add(newW);
            }
        }
        
        return repository.save(layoutToSave);
    }
}
