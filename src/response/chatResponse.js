class chatResponse {
    constructor(instant) {

        this.chatId = instant._id;
        this.senderUserId = instant.senderUserId ? instant.senderUserId : "";
        this.chatMessage = instant.chatText ? instant.chatText : "";
        this.createdAt = instant.createdAt ? instant.createdAt : "";

        this.receiverSeen = instant.receiverSeen ? instant.receiverSeen : false;
        this.recieverUserId = instant.recieverUserId
            ? instant.recieverUserId
            : "";
        this.chatRoomId = instant.chatRoomId ? instant.chatRoomId : "";
        this.messageType = instant.messageType ? instant.messageType : "";
        this.documentName = instant.documentName ? instant.documentName : "";

        //Users Details....
        this.name = instant.name ? instant.name : "";
        this.profileImageUrl = instant.profileImageUrl
            ? instant.profileImageUrl
            : "";
        this.userId = instant.userId ? instant.userId : "";

    }
};

export default chatResponse;