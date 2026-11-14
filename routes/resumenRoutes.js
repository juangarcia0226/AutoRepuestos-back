const { Router } = require('express')
const { getResumen } = require('../controllers/resumenController')

const router = Router()

router.get('/', getResumen)

module.exports = router