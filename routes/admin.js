const express = require("express")
const { model } = require("mongoose")
const UserController = require("../controllers/admin/Users.controller")
const CheckUserIsAdmin = require("../middlewares/admin/chechUserIsAdmin.middleware")
const router = express.Router()

router.use(CheckUserIsAdmin)
router.get('/users', UserController.getUsers)


module.exports = router