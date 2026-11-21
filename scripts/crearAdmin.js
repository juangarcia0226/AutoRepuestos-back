require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Usuario = require('../models/usuario')
const { mongoConnect } = require('../configurations/database')
const { esProduccion } = require('../configurations/entorno')

// En desarrollo usa la cuenta de prueba que usa el front.
// En producción el correo y la clave deben venir de variables de entorno.
const NOMBRE = process.env.ADMIN_NOMBRE || 'Administrador'
const CORREO = (process.env.ADMIN_CORREO || 'admin@autorepuestos.com').trim().toLowerCase()
const CLAVE = process.env.ADMIN_CLAVE || '123456'

const validarDatos = () => {
    if (!esProduccion) return null

    if (!process.env.ADMIN_CORREO || !process.env.ADMIN_CLAVE) {
        return 'En producción debes definir ADMIN_CORREO y ADMIN_CLAVE'
    }
    if (CLAVE.length < 8 || CLAVE === '123456') {
        return 'En producción, ADMIN_CLAVE debe tener al menos 8 caracteres y no puede ser la clave de prueba'
    }
    return null
}

const crearAdmin = async () => {
    const problema = validarDatos()
    if (problema) {
        console.error(problema)
        process.exitCode = 1
        return
    }

    try {
        await mongoConnect()
        console.log(`Base de datos: ${mongoose.connection.name}`)

        const existe = await Usuario.findOne({ correo: CORREO })
        if (existe) {
            // Asegura el rol admin y que esté activo; no cambia la clave
            await Usuario.updateOne({ _id: existe._id }, { $set: { rol: 'admin', activo: true } })
            console.log('El usuario administrador ya existe; se aseguró su rol de administrador')
            return
        }

        const hash = await bcrypt.hash(CLAVE, 10)
        await Usuario.create({ nombre: NOMBRE, correo: CORREO, clave: hash, rol: 'admin' })
        console.log(`Usuario administrador creado: ${CORREO}`)
    } catch (e) {
        console.error(e)
        process.exitCode = 1
    } finally {
        await mongoose.disconnect()
    }
}

crearAdmin()