import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * @Method Create user schema
 * @author Neeraj-Mehra
 * @date 10-FEB-2025
 */
const userSchema = new Schema({
    name: { type: String, default: "" },
    email: { type: String, require: true },
    password: { type: String, require: true },
    phoneNumber: { type: String, default: "" },
    countryCode: { type: String, default: "" },
    address: { type: String, default: "" },
    token: { type: String, default: "" },
},
    {
        timestamps: true,
        typeCast: true
    }
);

const userModel = mongoose.model("users", userSchema);

export default userModel;