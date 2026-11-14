const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuario')

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
            usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo }
        })
    } catch (e) {
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

// Devuelve el usuario del token; sirve para validar la sesión al recargar el front
const perfil = async (request, response) => {
    try {
        const usuario = await Usuario.findById(request.usuario.id)
        if (!usuario || !usuario.activo) {
            return response.status(401).json({
                message: 'Usuario no válido'
            })
        }
        response.json({ id: usuario._id, nombre: usuario.nombre, correo: usuario.correo })
    } catch (e) {
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

module.exports = {
    login,
    perfil
}