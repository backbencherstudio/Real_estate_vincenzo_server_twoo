
export interface OverviewData {
    propertyLength: number;
    tenantLength: number;
    unitsLength: number;
    ownersLength: number;
    monthlyProperties: { date: string; count: number }[];
    monthlyTenants: { date: string; count: number }[];
}

export interface TPlanDetails {
    starter : number,
    growth : number,
    professional : number,
}

export interface TRealEstateAdvisor {
    name : string,
    designation : string,
    image : string,
    facebook : string,
    twitter : string,
    instagram : string,
    linkedin : string,
}