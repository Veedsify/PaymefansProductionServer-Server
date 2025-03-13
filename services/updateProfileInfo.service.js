const updateUserInfoService = require("../services/updateuserinfo.service");
async function updateProfileInfo(res, req) {
    const updateUser = await updateUserInfoService({...req.body}, req);
    if (!updateUser) {
        return res
            .status(500)
            .json({message: "Error updating profile", status: false});
    }

    return res.status(200).json({
        message: "File uploaded",
        status: true,
    });
}

module.exports = updateProfileInfo;