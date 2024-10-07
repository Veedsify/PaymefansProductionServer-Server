const express = require('express')
const router = express.Router()



router.post('/request-new-verification', (req, res) => {
     res.send('Hello World!') 
})




module.exports = router;