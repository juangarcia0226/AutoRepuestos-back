const { Router } = require('express')
const {
    getProductos,
    getProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productoController')

const router = Router()

router.get('/', getProductos)

router.get('/:id', getProductoPorId)

router.post('/', crearProducto)

router.put('/:id', actualizarProducto)

router.delete('/:id', eliminarProducto)

module.exports = router