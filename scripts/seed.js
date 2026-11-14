require('dotenv').config()
const mongoose = require('mongoose')
const Producto = require('../models/producto')
const Vehiculo = require('../models/vehiculo')
const Movimiento = require('../models/movimiento')
const { mongoConnect } = require('../configurations/database')
const { PRODUCTOS, VEHICULOS } = require('./datosIniciales')

// Reemplaza productos, vehículos y movimientos por los datos iniciales.
// No toca la colección de usuarios.
const cargarDatos = async () => {
    try {
        await mongoConnect()

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
    } finally {
        await mongoose.disconnect()
    }
}

cargarDatos()