const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuario')

// Protege una ruta: exige el encabezado  Authorization: Bearer <token>
// Además consulta al usuario en la base de datos en cada petición, para que
// desactivarlo o cambiarle el rol tenga efecto de inmediato.
const verificarToken = async (request, response, next) => {
    const encabezado = request.headers.authorization || ''
    const [tipo, token] = encabezado.split(' ')

    if (tipo !== 'Bearer' || !token) {
        return response.status(401).json({
            message: 'Token requerido'
        })
    }

    let payload
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
        return response.status(401).json({
            message: 'Token inválido o expirado'
        })
    }

    try {
        const usuario = await Usuario.findById(payload.id).select('nombre correo rol activo')
        if (!usuario || !usuario.activo) {
            return response.status(401).json({
                message: 'Usuario no válido'
            })
        }

        request.usuario = {
            id: usuario._id.toString(),
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        }
        next()
    } catch (e) {
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

module.exports = verificarToken