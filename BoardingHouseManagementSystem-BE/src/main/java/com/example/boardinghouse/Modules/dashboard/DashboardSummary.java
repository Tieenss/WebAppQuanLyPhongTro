package com.example.boardinghouse.Modules.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummary {
    private long buildingsCount;
    private long roomsCount;
    private long tenantsCount;
    private long contractsCount;
    private long invoicesCount;
    private long issuesCount;
    private long servicesCount;
}
