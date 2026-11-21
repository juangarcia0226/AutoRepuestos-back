require('dotenv').config()
const mongoose = require('mongoose')
const Producto = require('../models/producto')
const Vehiculo = require('../models/vehiculo')
const Movimiento = require('../models/movimiento')
const { mongoConnect } = require('../configurations/database')
const { esProduccion } = require('../configurations/entorno')
const { PRODUCTOS, VEHICULOS } = require('./datosIniciales')

// Reemplaza productos, vehículos y movimientos por los datos iniciales.
// No toca la colección de usuarios.
const cargarDatos = async () => {
    if (esProduccion && process.env.SEED_FORZAR !== 'si') {
        console.error('Este script borra productos, vehículos y movimientos.')
        console.error('En producción solo se ejecuta con SEED_FORZAR=si')
        process.exitCode = 1
        return
    }

    try {
        await mongoConnect()
        console.log(`Base de datos: ${mongoose.connection.name}`)

        await Promise.all([
            Producto.deleteMany(),
            Vehiculo.deleteMany(),
            Movimiento.deleteMany()
        ])

        const productos = await Producto.insertMany(PRODUCTOS)
        const vehiculos = await Vehiculo.insertMany(VEHICULOS)

        console.log(`Productos cargados: ${productos.length}`)
        console.log(`Vehículos cargados: ${vehiculos.length}`)
    } catch (e) {
        console.error(e)
        process.exitCode = 1
    } finally {
        await mongoose.disconnect()
    }
}

cargarDatos()