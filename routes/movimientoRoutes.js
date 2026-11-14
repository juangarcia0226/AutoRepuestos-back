const { Router } = require('express')
const { getMovimientos, registrarMovimiento } = require('../controllers/movimientoController')

const router = Router()

router.get('/', getMovimientos)

router.post('/', registrarMovimiento)

module.exports = router