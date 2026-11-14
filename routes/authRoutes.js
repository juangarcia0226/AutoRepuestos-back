const { Router } = require('express')
const { login, perfil } = require('../controllers/authController')
const verificarToken = require('../middlewares/verificarToken')

const router = Router()

router.post('/login', login)

router.get('/perfil', verificarToken, perfil)

module.exports = router