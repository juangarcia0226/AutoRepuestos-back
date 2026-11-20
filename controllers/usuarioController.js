const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Usuario = require('../models/usuario')

const CLAVE_MINIMA = 6

// Respuesta sin la clave ni campos internos
const sinClave = (usuario) => {
    const datos = usuario.toObject()
    delete datos.clave
    delete datos.__v
    return datos
}

const manejarError = (e, response) => {
    // 11000: error de MongoDB por valor duplicado en un campo unique
    if (e.code === 11000) {
        return response.status(409).json({
            message: 'Ya existe un usuario con ese correo'
        })
    }
    if (e.name === 'ValidationError') {
        const mensajes = Object.values(e.errors).map((err) => err.message)
        return response.status(400).json({
            message: mensajes.join(', ')
        })
    }
    if (e.name === 'CastError') {
        return response.status(400).json({
            message: `Valor inválido en el campo ${e.path}`
        })
    }
    console.error(e)
    response.status(500).json({
        message: 'Error general'
    })
}

const idValido = (id, response) => {
    if (!mongoose.isValidObjectId(id)) {
        response.status(400).json({ message: 'Id inválido' })
        return false
    }
    return true
}

const getUsuarios = async (request, response) => {
    try {
        const usuarios = await Usuario.find().sort({ nombre: 1 })
        response.json(usuarios.map(sinClave))
    } catch (e) {
        manejarError(e, response)
    }
}

const crearUsuario = async (request, response) => {
    try {
        const { nombre, correo, clave, rol } = request.body // destructuring

        if (typeof clave !== 'string' || clave.length < CLAVE_MINIMA) {
            return response.status(400).json({
                message: `La clave debe tener al menos ${CLAVE_MINIMA} caracteres`
            })
        }

        const hash = await bcrypt.hash(clave, 10)
        const usuario = new Usuario({ nombre, correo, clave: hash, rol })
        await usuario.save()
        response.status(201).json(sinClave(usuario))
    } catch (e) {
        manejarError(e, response)
    }
}

// Se pueden cambiar nombre, rol, estado (activo) y clave. El correo no se modifica.
const actualizarUsuario = async (request, response) => {
    try {
        const { id } = request.params
        if (!idValido(id, response)) return

        const { nombre, rol, activo, clave } = request.body

        // Un administrador no puede dejarse sin acceso a sí mismo
        const esUnoMismo = id === request.usuario.id
        if (esUnoMismo && ((rol !== undefined && rol !== 'admin') || activo === false)) {
            return response.status(400).json({
                message: 'No puedes quitarte el rol de administrador ni desactivar tu propia cuenta'
            })
        }
        if (activo !== undefined && typeof activo !== 'boolean') {
            return response.status(400).json({ message: 'El estado debe ser verdadero o falso' })
        }

        const datos = {}
        if (nombre !== undefined) datos.nombre = nombre
        if (rol !== undefined) datos.rol = rol
        if (activo !== undefined) datos.activo = activo
        if (clave !== undefined) {
            if (typeof clave !== 'string' || clave.length < CLAVE_MINIMA) {
                return response.status(400).json({
                    message: `La clave debe tener al menos ${CLAVE_MINIMA} caracteres`
                })
            }
            datos.clave = await bcrypt.hash(clave, 10)
        }

        const usuario = await Usuario.findByIdAndUpdate(id, datos, {
            new: true,
            runValidators: true
        })
        if (!usuario) {
            return response.status(404).json({ message: 'Usuario no encontrado' })
        }
        response.json(sinClave(usuario))
    } catch (e) {
        manejarError(e, response)
    }
}

const eliminarUsuario = async (request, response) => {
    try {
        const { id } = request.params
        if (!idValido(id, response)) return

        if (id === request.usuario.id) {
            return response.status(400).json({
                message: 'No puedes eliminar tu propia cuenta'
            })
        }

        const usuario = await Usuario.findByIdAndDelete(id)
        if (!usuario) {
            return response.status(404).json({ message: 'Usuario no encontrado' })
        }
        response.json({ message: `Usuario eliminado: ${usuario.nombre}` })
    } catch (e) {
        manejarError(e, response)
    }
}

module.exports = {
    getUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
}