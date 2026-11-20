const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuario')

const CLAVE_MINIMA = 6

const login = async (request, response) => {
    try {
        const { correo, clave } = request.body // destructuring

        if (typeof correo !== 'string' || typeof clave !== 'string' || !correo || !clave) {
            return response.status(400).json({
                message: 'Correo y contraseña requeridos'
            })
        }

        const usuario = await Usuario.findOne({ correo: correo.trim().toLowerCase() }).select('+clave')
        const claveOk = usuario ? await bcrypt.compare(clave, usuario.clave) : false

        // Mismo mensaje si el correo no existe o la clave es incorrecta
        if (!claveOk) {
            return response.status(401).json({
                message: 'Correo o contraseña incorrectos'
            })
        }
        if (!usuario.activo) {
            return response.status(403).json({
                message: 'Usuario inactivo'
            })
        }

        const token = jwt.sign(
            { id: usuario._id, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        )

        response.json({
            token,
            usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
        })
    } catch (e) {
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

// Devuelve el usuario del token; sirve para validar la sesión al recargar el front.
// verificarToken ya comprobó que existe y está activo.
const perfil = (request, response) => {
    response.json(request.usuario)
}

// Cambio de la contraseña propia
const cambiarClave = async (request, response) => {
    try {
        const { claveActual, claveNueva } = request.body

        if (typeof claveActual !== 'string' || typeof claveNueva !== 'string' || !claveActual || !claveNueva) {
            return response.status(400).json({
                message: 'Debes enviar la contraseña actual y la nueva'
            })
        }
        if (claveNueva.length < CLAVE_MINIMA) {
            return response.status(400).json({
                message: `La nueva contraseña debe tener al menos ${CLAVE_MINIMA} caracteres`
            })
        }
        if (claveNueva === claveActual) {
            return response.status(400).json({
                message: 'La nueva contraseña debe ser distinta a la actual'
            })
        }

        const usuario = await Usuario.findById(request.usuario.id).select('+clave')
        const claveOk = await bcrypt.compare(claveActual, usuario.clave)
        // 400 y no 401: el front cierra la sesión cuando recibe un 401
        if (!claveOk) {
            return response.status(400).json({
                message: 'La contraseña actual es incorrecta'
            })
        }

        usuario.clave = await bcrypt.hash(claveNueva, 10)
        await usuario.save()
        response.json({ message: 'Contraseña actualizada' })
    } catch (e) {
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

module.exports = {
    login,
    perfil,
    cambiarClave
}