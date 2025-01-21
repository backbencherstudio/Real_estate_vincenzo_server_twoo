import { TMaintenance } from "./maintenance.interface";
import { Maintenance } from "./maintenance.module";


const createMaintenanceIntoDB =  async (payload : TMaintenance )=>{
    const result = await Maintenance.create(payload)
    return result
}


const getAllMaintenanceRequestFromDB = async (id : string)=>{
    const result = await Maintenance.find({userId : id }).sort({createdAt : -1})
    return result
}





export const MaintenanceService = {
    createMaintenanceIntoDB,
    getAllMaintenanceRequestFromDB
}



