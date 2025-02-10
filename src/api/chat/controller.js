import chatTable from "../../models/chatMessage.js";
import chatResponse from "../../response/chatResponse.js";
import mongoose from "mongoose";
import randomstring from "randomstring";
/**
 * @MEthod used to send message
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const sendMessage = async (req, res) => {
    try {
        //get data in body
        const {
            recieverUserId,
            chatText,
            roomId,
            messageType,
        } = req.body;

        if (!recieverUserId || !chatText || roomId || !messageType) {
            return res.status(400).send({
                status: false,
                message: "Some fields are missing."
            })
        }

        //decoded sender user id
        const senderUserId = req.user.id;

        let messageParam = {};
        messageParam.senderUserId = senderUserId;
        messageParam.recieverUserId = recieverUserId;
        messageParam.chatText = chatText;
        messageParam.messageType = messageType;
        messageParam.chatRoomId = roomId;

        //save Chat Data
        const chatDatasave = new chatTable(messageParam);
        const saveChatData = await chatDatasave.save();

        //Common chatResponse
        let finalData = new chatResponse(saveChatData);

        io.emit("sendMessage", finalData);

        console.log("SMS send successfully");

        return res.status(200).send({
            status: true,
            message: "Success",
        });

    } catch (error) {
        console.log("sendMessage : Error==>> ", error)
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
}


/**
   * @Method Use to get User Chat List
   * @author Neeraj Mehra
   * @date 10-FEB-2025
*/
export const getUserChatList = async (data) => {
    try {
        const { page, perPage, type, userId } = data;

        const pageNo = page ? (page - 1) * perPage : 0;

        const chatDetail = await chatTable
            .aggregate([
                {
                    $match: {
                        $or: [
                            {
                                senderUserId: mongoose.Types.ObjectId(userId),
                            },
                            {
                                recieverUserId: mongoose.Types.ObjectId(userId),
                            },
                        ],
                    },
                },
                {
                    $group: {
                        _id: { chatRoomId: { chatRoomId: "$chatRoomId" } },
                        senderUserId: { $last: "$senderUserId" },
                        recieverUserId: { $last: "$recieverUserId" },
                        chatText: { $last: "$chatText" },
                        chatSendTime: { $last: "$chatSendTime" },
                        chatRoomId: { $last: "$chatRoomId" },
                        messageType: { $last: "$messageType" },
                        documentName: { $last: "$documentName" },
                        chatType: { $last: "$chatType" },
                    },
                },

                { $sort: { chatSendTime: -1 } },
            ])
            .skip(pageNo)
            .limit(perPage);

        let finalData = [];
        if (chatDetail && chatDetail.length > 0) {
            let promises = chatDetail.map(async (userChatList) => {
                //get unread chat total count
                const unreadChatCount = await chatModel.find(
                    {
                        // $match: {
                        recieverUserId: mongoose.Types.ObjectId(userId),
                        chatRoomId: userChatList.chatRoomId,
                        receiverSeen: false,
                        chatType: userChatList.chatType,
                    }
                );

                let count = 0;
                if (unreadChatCount && unreadChatCount.length > 0) {
                    count = unreadChatCount.length;
                }
                //
                const userObj = {};
                let frountUserId = userId;

                let currentUserId = userChatList.senderUserId;
                if (userId.toString() == currentUserId) {
                    frountUserId = userChatList.recieverUserId;
                } else if (userId.toString() == userChatList.recieverUserId) {
                    frountUserId = userChatList.senderUserId;
                }
                //get user data
                const userDetailFind = await User.findOne({
                    _id: mongoose.Types.ObjectId(frountUserId),
                });

                if (userDetailFind) {
                    userObj.userName = userDetailFind.name ? userDetailFind.name : "";
                    userObj.userImageUrl =
                        userDetailFind && userDetailFind.profileImageUrl
                            ? AWS_IMAGE_URL + userDetailFind.profileImageUrl
                            : "";
                    userObj.online = userDetailFind.isOnlineOffline
                        ? userDetailFind.isOnlineOffline
                        : false;
                    userObj.userId = userDetailFind._id;
                }

                userObj.lastText = userChatList.chatText;
                userObj.chatId = userChatList.chatId;
                userObj.recieverUserId = userChatList.recieverUserId;
                userObj.chatSendTime = userChatList.chatSendTime;
                userObj.chatRoomId = userChatList.chatRoomId;
                userObj.messageType = userChatList.messageType;
                userObj.documentName = userChatList.documentName;
                userObj.unreadCount = count;

                return userObj;
            });

            finalData = await Promise.all(promises);

            io.emit("getChatList", { dataList: finalData })

        } else {

            io.emit("getChatList", { dataList: [] })
        }
    } catch (error) {
        logger.info("getPersonalUserChatList : Error===" + error);
        return res.send({
            status: 0,
            message: error.message,
        });
    }
}

/**
 * @MEthod method used to create chat room id
 * @author Neeraj-Mehra
 * @date 10-FEB-2025
 */
export const createRoomId = async (data) => {
    try {
        //get data in body
        const { recieverUserId, userId } = data;

        let checkChatRoomId = {};

        //chech id already created
        const getChatRoomId = await chatTable.findOne({
            recieverUserId: recieverUserId,
            senderUserId: userId,
        }).lean();

        if (getChatRoomId) {
            checkChatRoomId = getChatRoomId;
        } else {
            checkChatRoomId = await chatTable.findOne({
                recieverUserId: userId,
                senderUserId: recieverUserId,
            }).lean();
        }
        if (checkChatRoomId) {

            io.emit("chatRoomCreated", { chatRoomId: checkChatRoomId.chatRoomId });

        }
        //generate random room id
        let randomDigit;
        randomDigit = randomstring.generate({
            length: 6,
            charset: "numeric",
        });
        //check room id alread exist or not if exist then generate new room id
        let chatInfo = await chatTable.find({
            chatRoomId: randomDigit,
        });
        if (chatInfo) {
            randomDigit = randomstring.generate({
                length: 6,
                charset: "numeric",
            });
        }

        console.log("createRoomId : successfully===" + randomDigit);

        io.emit("chatRoomCreated", {
            chatRoomId: randomDigit,
        });

    } catch (error) {
        console.log("createRoomId : Error==>> ", error);
        return res.status(500).send({
            status: false,
            message: err.message,
        });
    }
};

/**
 * @MEthod method used to create chat room id
 * @author Neeraj-Mehra
 * @date 10-FEB-2025
 */
export const readChatList = async (data) => {

    if (data.userId && data.chatRoomId) {

        //update read flag
        const obj = await chatTable.updateMany(
            {
                chatRoomId: data.chatRoomId,
                recieverUserId: data.userId,
            },
            {
                $set: {
                    receiverSeen: true,
                },
            }
        );
    }
};
