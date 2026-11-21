const { Router } = require('express')
const { login, perfil, cambiarClave } = require('../controllers/authController')
const verificarToken = require('../middlewares/verificarToken')
const limitarLogin = require('../middlewares/limitarLogin')

const router = Router()

router.post('/login', limitarLogin, login)

router.get('/perfil', verificarToken, perfil)

router.put('/clave', verificarToken, cambiarClave)

module.exports = router