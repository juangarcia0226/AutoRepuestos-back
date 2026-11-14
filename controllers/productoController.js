const Producto = require('../models/producto')

const getProductos = async (request, response) => {
    try {
        const productos = await Producto.find().sort({ nombre: 1 })
        response.json(productos)
    } catch (e) {
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

const crearProducto = async (request, response) => {
    try {
        const { nombre, referencia, marca, categoria, stock, stockMinimo, precio, ubicacion } = request.body // destructuring
        const producto = new Producto({ nombre, referencia, marca, categoria, stock, stockMinimo, precio, ubicacion })
        await producto.save()
        response.status(201).json(producto)
    } catch (e) {
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
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

module.exports = {
    getProductos,
    crearProducto
}