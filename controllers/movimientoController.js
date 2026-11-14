const mongoose = require('mongoose')
const Movimiento = require('../models/movimiento')
const Producto = require('../models/producto')

const TIPOS = ['entrada', 'salida']

// Error con código HTTP, para cortar la transacción y responder con el mensaje correcto
class ErrorNegocio extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
    }
}

const getMovimientos = async (request, response) => {
    try {
        // ?limite=6 -> últimos 6 movimientos (por defecto 10, máximo 100)
        const limite = Math.min(Math.max(parseInt(request.query.limite) || 10, 1), 100)

        const movimientos = await Movimiento.find()
            .sort({ fechaCreacion: -1 })
            .limit(limite)
            .populate('producto', 'nombre referencia')

        response.json(movimientos)
    } catch (e) {
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    }
}

const registrarMovimiento = async (request, response) => {
    const session = await mongoose.startSession()
    try {
        const { tipo, productoId, cantidad, usuario } = request.body // destructuring
        const unidades = Number(cantidad)

        if (!TIPOS.includes(tipo)) {
            return response.status(400).json({ message: 'El tipo debe ser entrada o salida' })
        }
        if (!mongoose.isValidObjectId(productoId)) {
            return response.status(400).json({ message: 'Id de producto inválido' })
        }
        if (!Number.isInteger(unidades) || unidades < 1) {
            return response.status(400).json({ message: 'La cantidad debe ser un entero de al menos 1' })
        }

        let movimiento
        await session.withTransaction(async () => {
            // Una sola operación: en una salida solo actualiza si alcanza el stock
            const filtro = { _id: productoId }
            if (tipo === 'salida') filtro.stock = { $gte: unidades }

            const producto = await Producto.findOneAndUpdate(
                filtro,
                { $inc: { stock: tipo === 'salida' ? -unidades : unidades } },
                { new: true, session }
            )

            if (!producto) {
                // No se actualizó: o no existe, o no alcanzaba el stock
                const actual = await Producto.findById(productoId).session(session)
                if (!actual) throw new ErrorNegocio(404, 'Producto no encontrado')
                throw new ErrorNegocio(409, `Stock insuficiente: hay ${actual.stock} unidades`)
            }

            const [creado] = await Movimiento.create(
                [{ tipo, producto: producto._id, cantidad: unidades, usuario }],
                { session }
            )
            movimiento = creado
        })

        response.status(201).json(movimiento)
    } catch (e) {
        if (e instanceof ErrorNegocio) {
            return response.status(e.status).json({ message: e.message })
        }
        if (e.name === 'ValidationError') {
            const mensajes = Object.values(e.errors).map((err) => err.message)
            return response.status(400).json({ message: mensajes.join(', ') })
        }
        console.error(e)
        response.status(500).json({
            message: 'Error general'
        })
    } finally {
        await session.endSession()
    }
}

module.exports = {
    getMovimientos,
    registrarMovimiento
}