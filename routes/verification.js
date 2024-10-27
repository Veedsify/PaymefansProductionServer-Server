const express = require('express');
const CheckUserIsAuthenticatedMiddleware = require('../middlewares/checkUserIsAuthenticated.middleware');
const { StartVerification } = require('../controllers/verification/verification.controller');
const HandleMediaUpload = require('../middlewares/verifcation/verifcationMedia.middleware');
const router = express.Router()


router.post('/process/vefications', CheckUserIsAuthenticatedMiddleware, HandleMediaUpload, StartVerification)




module.exports = router;