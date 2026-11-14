const { Router } = require('express')
const { getProductos, crearProducto } = require('../controllers/productoController')

const router = Router()

router.get('/', getProductos)

router.post('/', crearProducto)

module.exports = router