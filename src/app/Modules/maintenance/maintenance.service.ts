import { emergencyMaintenanceRemainderEmail } from "../../utils/emergencyMaintenanceRemainderEmail";
import { User } from "../User/user.model";
import { TMaintenance } from "./maintenance.interface";
import { Maintenance } from "./maintenance.module";


const createMaintenanceIntoDB = async (payload: TMaintenance) => {
    if (payload?.isEmergency === true || payload?.isEmergency === "true") {        
        const ownerData = await User.findById(payload?.ownerId).select('email');
        if (ownerData?.email) {
            await emergencyMaintenanceRemainderEmail(ownerData.email);
        } else {
            console.log("Owner email not found");
        }
    }
    const result = await Maintenance.create(payload);
    return result;
};


const getAllMaintenanceRequestFromDB = async (id : string)=>{
    const result = await Maintenance.find({userId : id }).sort({createdAt : -1})
    return result
}





export const MaintenanceService = {
    createMaintenanceIntoDB,
    getAllMaintenanceRequestFromDB
}



