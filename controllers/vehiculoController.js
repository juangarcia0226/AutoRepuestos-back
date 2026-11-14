const Vehiculo = require('../models/vehiculo')

const getVehiculos = async (request, response) => {
    try {
        const vehiculos = await Vehiculo.find().sort({ marca: 1, modelo: 1 })
        response.json(vehiculos)
    } catch (e) {
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

const crearVehiculo = async (request, response) => {
    try {
        const { marca, modelo, desde, hasta } = request.body // destructuring
        const vehiculo = new Vehiculo({ marca, modelo, desde, hasta })
        await vehiculo.save()
        response.status(201).json(vehiculo)
    } catch (e) {
        if (e.code === 11000) {
            return response.status(409).json({
                message: 'Ya existe un vehículo con esa marca y modelo'
            })
        }
        if (e.name === 'ValidationError') {
            const mensajes = Object.values(e.errors).map((err) => err.message)
            return response.status(400).json({
                message: mensajes.join(', ')
            })
        }
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

module.exports = {
    getVehiculos,
    crearVehiculo
}