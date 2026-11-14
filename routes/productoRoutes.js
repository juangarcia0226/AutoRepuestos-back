const { Router } = require('express')
const {
    getProductos,
    getProductoPorId,
    buscarCompatibles,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productoController')

const router = Router()

router.get('/', getProductos)

// Debe ir antes de '/:id'; si no, Express tomaría "compatibles" como un id
router.get('/compatibles', buscarCompatibles)

router.get('/:id', getProductoPorId)

router.post('/', crearProducto)

router.put('/:id', actualizarProducto)

router.delete('/:id', eliminarProducto)

module.exports = router