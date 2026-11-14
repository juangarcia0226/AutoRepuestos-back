const jwt = require('jsonwebtoken')

// Protege una ruta: exige el encabezado  Authorization: Bearer <token>
const verificarToken = (request, response, next) => {
    const encabezado = request.headers.authorization || ''
    const [tipo, token] = encabezado.split(' ')

    if (tipo !== 'Bearer' || !token) {
        return response.status(401).json({
            message: 'Token requerido'
        })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        request.usuario = { id: payload.id, nombre: payload.nombre }
        next()
    } catch (e) {
        response.status(401).json({
            message: 'Token inválido o expirado'
        })
    }
}

module.exports = verificarToken