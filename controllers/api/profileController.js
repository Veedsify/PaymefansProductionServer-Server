const sharp = require("sharp");
const prismaQuery = require("../../utils/prisma");
const updateBannerService = require("../../services/updatebanner.service");
const updateProfileService = require("../../services/updateprofile.service");
const updateProfileInfo = require("../../services/updateProfileInfo.service");
const s3 = require("../../libs/s3");
const { log } = require("debug");
const { CLOUDFRONT_URL } = process.env;
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { SERVER_ORIGINAL_URL } = process.env;
const { v4: uuidv4 } = require("uuid");
const convertBannerToBufferService = require("../../services/profiles/convert-banner-to-buffer.service");
const uploadBannerToS3Service = require("../../services/profiles/upload-banner-to-s3.service");
const { cloudinary } = require("../../utils/cloudinary");
const {
  uploadBufferCloudinary,
} = require("../../utils/cloudinary/upload-buffer-cloudinary");

class profileController {
  // Profile
  static async Profile(req, res) {
    const { username } = req.body;
    const id = username.replace(/%40/g, "@");
    const user = await prismaQuery.user.findFirst({
      where: {
        username: id,
      },
      select: {
        id: true,
        username: true,
        name: true,
        fullname: true,
        user_id: true,
        admin: true,
        role: true,
        is_active: true,
        is_verified: true,
        website: true,
        country: true,
        location: true,
        city: true,
        zip: true,
        post_watermark: true,
        total_followers: true,
        total_following: true,
        total_subscribers: true,
        email: true,
        profile_image: true,
        profile_banner: true,
        bio: true,
        Subscribers: {
          select: {
            subscriber_id: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(200).json({ message: "User not found", status: false });
    }
    const { password, ...rest } = user;
    return res
      .status(200)
      .json({ message: "User found", status: true, user: rest });
  }

  // Banner image change
  static async BannerChange(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res
          .status(500)
          .json({ message: "No file uploaded", status: false });
      }

      //convert image
      const profileBanner = await uploadBufferCloudinary(
        file.buffer,
        {
          width: 1200,
          height: 400,
          crop: "fill",
          // gravity: "adv_face", // REQSUBI
        },
        "image",
        req.user.id,
        "profile_banner"
      );

      //   const profileBanner = await convertBannerToBufferService(
      const updateUser = await updateBannerService(
        profileBanner.secure_url,
        req
      );
      if (!updateUser) {
        return res
          .status(500)
          .json({ message: "Error updating banner", status: false });
      }

      return res.status(200).json({
        message: "File uploaded",
        status: true,
        image: "/images/converted/" + file.filename,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error uploading file", status: false });
    }
  }

  // Profile image change
  static async ProfileChange(req, res) {
    try {
      const file = req.file;
      if (!file) {
        await updateProfileInfo(res, req);
      } else {
        const profileUrl = await uploadBufferCloudinary(
          file.buffer,
          {
            width: 250,
            height: 250,
            crop: "fill",
            // gravity: "adv_face", // REQSUBI
          },
          "image",
          req.user.id,
          "profile_picture"
        );

        // Update user
        let updateUserProfile = await updateProfileService(
          profileUrl.secure_url,
          req
        );

        if (!updateUserProfile) {
          return res
            .status(500)
            .json({ message: "Error updating profile", status: false });
        }

        await updateProfileInfo(res, req);
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Error updating profile", status: false });
    }
  }

  // Settings profile change
  static async  SettingsProfileChange(req, res) {
    try {
      await updateProfileInfo(res, req);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error updating profile", status: false });
    }
  }

  //Hookup status change
  static async HookupStatusChange(req, res) {
    try {
      const { hookup } = req.body;
      const user = req.user;
      const changeHookupStatus = await prismaQuery.user.update({
        where: {
          id: user.id,
        },
        data: {
          Model: {
            update: {
              hookup: hookup === true ? true : false,
            },
          },
        },
      });
      if (!changeHookupStatus) {
        return res
          .status(500)
          .json({ message: "Error updating hookup status", status: false });
      }
      return res
        .status(200)
        .json({ message: "Hookup status updated", status: true });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error updating hookup status", status: false });
    }
  }
}

module.exports = profileController;
