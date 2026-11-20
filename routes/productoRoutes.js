const { Router } = require('express')
const {
    getProductos,
    getProductoPorId,
    buscarCompatibles,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productoController')
const autorizarRoles = require('../middlewares/autorizarRoles')

const router = Router()

router.get('/', getProductos)

// Debe ir antes de '/:id'; si no, Express tomaría "compatibles" como un id
router.get('/compatibles', buscarCompatibles)

router.get('/:id', getProductoPorId)

// Crear, editar y eliminar: solo administradores
router.post('/', autorizarRoles('admin'), crearProducto)

router.put('/:id', autorizarRoles('admin'), actualizarProducto)

router.delete('/:id', autorizarRoles('admin'), eliminarProducto)

module.exports = router