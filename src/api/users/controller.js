//NPM
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
//Models
import userModel from "../../models/user.js";
//Response
import userResponse from "../../response/userResponse.js";
//Functions
import { emailExist, getUserByEmail, getUserById } from "./service.js";
import { createJwtToken, getMessage } from "../../helper/common/helpers.js";


/**
 * @Method Method used to register new user in platform
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 10-FEB-2025
 */
export const userRegister = async (req, res) => {
    try {
        const { language = "en", name, email, password, address, countryCode, phoneNumber } = req.body;

        //use validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: false,
                message: await getMessage(language, errors.errors[0]["msg"]),
            })
        }
        //email valid regex
        let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(email)) {
            return res.send({
                status: false,
                message: await getMessage(language, "Invalid_Email_Address")
            });
        }

        //email convert in lower case
        const lowerEmail = email.toLowerCase();

        //function used to check email already exist or not
        const checkEmail = await emailExist(lowerEmail);
        if (checkEmail) {
            return res.send({
                status: false,
                message: await getMessage(language, "Email_Already_Exist"),
            });

        }

        const userObj = new userModel({
            name: name || "",
            email: lowerEmail,
            password: bcrypt.hashSync(password, 10),
            address: address || "",
            countryCode: countryCode || "",
            phoneNumber: phoneNumber || ""
        });

        const userSave = await userObj.save();

        if (userSave) {
            //create jwt token
            const jwtToken = await createJwtToken({ id: userSave._id });

            return res.status(200).send({
                status: true,
                token: jwtToken,
                message: await getMessage(language, "User_Register_Success"),
            })
        }

        return res.send({
            status: false,
            message: await getMessage(language, "Feild_To_Register_User"),
        });

    } catch (error) {

        return res.send({
            status: false,
            message: error.message,
        })
    }
};

/**
 * @Method method used to user login by email and password
 * @param {*} req 
 * @param {*} res 
 * @date 10-FEB-2025 
 */
export const userLogin = async (req, res) => {
    try {

        const { language, email, password } = req.body;

        //valifation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({
                status: false,
                message: await getMessage(language, errors.error[0]['msg']),
            })
        }
        //get user by email
        const checkUser = await getUserByEmail(email.toLowerCase());
        if (!checkUser) {
            return res.status(404).send({
                status: false,
                message: await getMessage(language, "User_Does_Not_Exist"),
            })
        }

        if (bcrypt.compareSync(password, checkUser.password)) {

            //generate jwt token
            const token = await createJwtToken({ id: checkUser._id });

            return res.status(200).send({
                status: true,
                message: await getMessage(language, "User_Login_Success"),
                token: token,
                data: new userResponse(checkUser),
            })
        } else {
            return res.status(400).send({
                status: false,
                message: await getMessage(language, "Envalid_Email_Password")
            })
        }
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}