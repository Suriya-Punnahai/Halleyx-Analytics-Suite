package com.halleyx.dashboard.controller;

import com.halleyx.dashboard.model.DashboardLayout;
import com.halleyx.dashboard.service.DashboardLayoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardLayoutService service;

    @GetMapping
    public ResponseEntity<DashboardLayout> getDashboard() {
        return ResponseEntity.ok(service.getDashboard("default"));
    }

    @PostMapping
    public ResponseEntity<DashboardLayout> saveDashboard(@RequestBody DashboardLayout layout) {
        layout.setName("default"); // Force single default dashboard for UI simplicity
        return ResponseEntity.ok(service.saveDashboard(layout));
    }
}
