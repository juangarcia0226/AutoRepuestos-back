const { Router } = require('express')
const {
    getVehiculos,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
} = require('../controllers/vehiculoController')

const router = Router()

router.get('/', getVehiculos)

router.post('/', crearVehiculo)

router.put('/:id', actualizarVehiculo)

router.delete('/:id', eliminarVehiculo)

module.exports = router