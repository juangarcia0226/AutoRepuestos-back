const { Router } = require('express')
const { getVehiculos, crearVehiculo } = require('../controllers/vehiculoController')

const router = Router()

router.get('/', getVehiculos)

router.post('/', crearVehiculo)

module.exports = router