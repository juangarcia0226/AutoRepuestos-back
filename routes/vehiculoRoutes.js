const { Router } = require('express')
const {
    getVehiculos,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
} = require('../controllers/vehiculoController')
const autorizarRoles = require('../middlewares/autorizarRoles')

const router = Router()

router.get('/', getVehiculos)

// Crear, editar y eliminar: solo administradores
router.post('/', autorizarRoles('admin'), crearVehiculo)

router.put('/:id', autorizarRoles('admin'), actualizarVehiculo)

router.delete('/:id', autorizarRoles('admin'), eliminarVehiculo)

module.exports = router