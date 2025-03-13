const express = require('express');
const { StartVerification } = require('../controllers/verification/verification.controller');
const HandleMediaUpload = require('../middlewares/verifcation/verifcationMedia.middleware');
const router = express.Router()


router.post('/process/:token', HandleMediaUpload.fields([
     { name: 'front' },
     { name: 'back' },
     { name: 'faceVideo' }
]), StartVerification)



module.exports = router;