const Producto = require('../models/producto')

const getResumen = async (request, response) => {
    try {
        const [totalProductos, alertas] = await Promise.all([
            Producto.countDocuments(),
            // Alerta = stock igual o menor al mínimo (incluye los agotados).
            // Primero los de menos stock, es decir, los agotados.
            Producto.find({ $expr: { $lte: ['$stock', '$stockMinimo'] } })
                .select('nombre referencia marca stock stockMinimo')
                .sort({ stock: 1, nombre: 1 })
        ])

        const totalAgotados = alertas.filter((p) => p.stock === 0).length
        const totalBajo = alertas.length - totalAgotados

        response.json({
            totalProductos,
            totalBajo,
            totalAgotados,
            alertas
        })
    } catch (e) {
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

module.exports = {
    getResumen
}