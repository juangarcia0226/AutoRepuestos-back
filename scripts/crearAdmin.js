require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Usuario = require('../models/usuario')
const { mongoConnect } = require('../configurations/database')

// Crea la cuenta de prueba que usa el front
const CORREO = 'admin@autorepuestos.com'
const CLAVE = '123456'

const crearAdmin = async () => {
    try {
        await mongoConnect()

        const existe = await Usuario.findOne({ correo: CORREO })
        if (existe) {
            console.log('El usuario administrador ya existe')
            return
        }

        const hash = await bcrypt.hash(CLAVE, 10)
        await Usuario.create({ nombre: 'Administrador', correo: CORREO, clave: hash })
        console.log(`Usuario administrador creado: ${CORREO}`)
    } catch (e) {
        console.error(e)
    } finally {
        await mongoose.disconnect()
    }
}

crearAdmin()