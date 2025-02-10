class userResponse {
    constructor(instant) {
        this.userId = instant._id ? instant._id : "";
        this.name = instant.name ? instant.name : "";
        this.email = instant.email ? instant.email : "";
        this.phoneNumber = instant.phoneNumber ? instant.phoneNumber : "";
        this.countryCode = instant.countryCode ? instant.countryCode : "";
        this.address = instant.address ? instant.address : "";
        this.createdAt = instant.createdAt ? instant.createdAt : "";
    }
};

export default userResponse;