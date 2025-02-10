import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Create Schema for chatting
 * @author Neeraj-Mehra
 * @date 10-FEB-2025
 */
const chatSchema = new Schema({
    senderUserId: {
        type: Schema.ObjectId,
        ref: "users",
        require: true,
    },
    recieverUserId: {
        type: Schema.ObjectId,
        ref: "users",
        require: true,
    },
    chatText: {
        type: String,
        default: null,
    },
    receiverSeen: {
        type: Boolean,
        default: false,
    },
    chatRoomId: {
        type: String,
        default: null,
    },
    messageType: {
        //-->simple text/image/video
        type: String,
        default: null,
    }
},
    {
        timestamps: true,
        typeCast: true
    }
);

const chatTable = mongoose.model("chatData", chatSchema);

export default chatTable;