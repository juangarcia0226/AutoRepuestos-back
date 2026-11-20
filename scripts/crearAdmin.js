require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Usuario = require('../models/usuario')
const { mongoConnect } = require('../configurations/database')

// Crea la cuenta de prueba que usa el front (cambiar la clave en producción)
const CORREO = 'admin@autorepuestos.com'
const CLAVE = '123456'

const crearAdmin = async () => {
    try {
        await mongoConnect()

        const existe = await Usuario.findOne({ correo: CORREO })
        if (existe) {
            // Asegura el rol admin y que esté activo (la cuenta pudo crearse antes de existir los roles)
            await Usuario.updateOne({ _id: existe._id }, { $set: { rol: 'admin', activo: true } })
            console.log('El usuario administrador ya existe; se aseguró su rol de administrador')
            return
        }

        const hash = await bcrypt.hash(CLAVE, 10)
        await Usuario.create({ nombre: 'Administrador', correo: CORREO, clave: hash, rol: 'admin' })
        console.log(`Usuario administrador creado: ${CORREO}`)
    } catch (e) {
        console.error(e)
    } finally {
        await mongoose.disconnect()
    }
}

crearAdmin()