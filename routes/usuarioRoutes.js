const { Router } = require('express')
const {
    getUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
} = require('../controllers/usuarioController')

const router = Router()

router.get('/', getUsuarios)

router.post('/', crearUsuario)

router.put('/:id', actualizarUsuario)

router.delete('/:id', eliminarUsuario)

module.exports = router