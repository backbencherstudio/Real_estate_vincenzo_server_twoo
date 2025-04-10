import { emergencyMaintenanceRemainderEmail } from "../../utils/emergencyMaintenanceRemainderEmail";
import { normalMaintenanceReminderEmail } from "../../utils/normalMaintenanceReminderEmail";
import { User } from "../User/user.model";
import { TMaintenance } from "./maintenance.interface";
import { Maintenance } from "./maintenance.module";


// const createMaintenanceIntoDB = async (payload: TMaintenance) => {
//     const ownerData = await User.findById(payload?.ownerId).select('email');

//     if (payload?.isEmergency === true || payload?.isEmergency === "true") {        
//         if (ownerData?.email) {
//             await emergencyMaintenanceRemainderEmail(ownerData.email);
//         } else {
//             console.log("Owner email not found");
//         }
//     }
//     else{
//         await normalMaintenanceReminderEmail(ownerData?.email)
//     }


//     const result = await Maintenance.create(payload);
//     return result;
// };


const createMaintenanceIntoDB = async (payload: TMaintenance) => {
    const ownerData = await User.findById(payload?.ownerId).select("email");
  
    // If owner not found or email missing, handle safely
    if (!ownerData?.email) {
      console.log("Owner email not found");
      return;
    }
  
    if (payload?.isEmergency === true || payload?.isEmergency === "true") {
      await emergencyMaintenanceRemainderEmail(ownerData.email);
    } else {
      await normalMaintenanceReminderEmail(ownerData.email);
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



