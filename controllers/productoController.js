const mongoose = require('mongoose')
const Producto = require('../models/producto')

// Campos que se pueden recibir desde el cliente
const CAMPOS = ['nombre', 'referencia', 'marca', 'categoria', 'stock', 'stockMinimo', 'precio', 'ubicacion']

// Respuesta de error única para todo el controlador
const manejarError = (e, response) => {
    // 11000: error de MongoDB por valor duplicado en un campo unique
    if (e.code === 11000) {
        return response.status(409).json({
            message: 'Ya existe un producto con esa referencia'
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

const getProductos = async (request, response) => {
    try {
        const productos = await Producto.find().sort({ nombre: 1 })
        response.json(productos)
    } catch (e) {
        manejarError(e, response)
    }
}

const getProductoPorId = async (request, response) => {
    try {
        const { id } = request.params
        if (!idValido(id, response)) return

        const producto = await Producto.findById(id)
        if (!producto) {
            return response.status(404).json({ message: 'Producto no encontrado' })
        }
        response.json(producto)
    } catch (e) {
        manejarError(e, response)
    }
}

const crearProducto = async (request, response) => {
    try {
        const { nombre, referencia, marca, categoria, stock, stockMinimo, precio, ubicacion } = request.body // destructuring
        const producto = new Producto({ nombre, referencia, marca, categoria, stock, stockMinimo, precio, ubicacion })
        await producto.save()
        response.status(201).json(producto)
    } catch (e) {
        manejarError(e, response)
    }
}

const actualizarProducto = async (request, response) => {
    try {
        const { id } = request.params
        if (!idValido(id, response)) return

        // Solo se actualizan los campos permitidos que vengan en el body
        const datos = {}
        CAMPOS.forEach((campo) => {
            if (request.body[campo] !== undefined) datos[campo] = request.body[campo]
        })

        const producto = await Producto.findByIdAndUpdate(id, datos, {
            new: true,
            runValidators: true
        })
        if (!producto) {
            return response.status(404).json({ message: 'Producto no encontrado' })
        }
        response.json(producto)
    } catch (e) {
        manejarError(e, response)
    }
}

const eliminarProducto = async (request, response) => {
    try {
        const { id } = request.params
        if (!idValido(id, response)) return

        const producto = await Producto.findByIdAndDelete(id)
        if (!producto) {
            return response.status(404).json({ message: 'Producto no encontrado' })
        }
        response.json({ message: `Producto eliminado: ${producto.nombre}` })
    } catch (e) {
        manejarError(e, response)
    }
}

module.exports = {
    getProductos,
    getProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
}