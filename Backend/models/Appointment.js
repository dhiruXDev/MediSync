import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientId : {
        type: mongoose.Schema.Types.ObjectId,
        ref  : "User",
        required : true,  
    },
    doctorId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    status : {
        type : String,
        enum : ["pending","approved","declined"],
        default : "pending",
    },
    scheduledTime  : {
        type : Date,
    },
    reason : {
        type :String
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

const Appointment = mongoose.model("Appointment",appointmentSchema);

export default Appointment;
