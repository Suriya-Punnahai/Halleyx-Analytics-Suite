package com.halleyx.dashboard.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Getter
@Setter
public class DashboardWidget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "layout_id")
    @JsonBackReference
    private DashboardLayout layout;

    private String widgetType;
    private String title;

    @Lob
    private String configuration;
}
