
export interface OverviewData {
    propertyLength: number;
    tenantLength: number;
    unitsLength: number;
    ownersLength: number;
    monthlyProperties: { date: string; count: number }[];
    monthlyTenants: { date: string; count: number }[];
}