const { Router } = require('express')
const { login, perfil, cambiarClave } = require('../controllers/authController')
const verificarToken = require('../middlewares/verificarToken')

const router = Router()

router.post('/login', login)

router.get('/perfil', verificarToken, perfil)

router.put('/clave', verificarToken, cambiarClave)

module.exports = router