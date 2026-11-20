const mongoose = require('mongoose')
const Vehiculo = require('../models/vehiculo')
const Producto = require('../models/producto')

const manejarError = (e, response) => {
    // 11000: error de MongoDB por valor duplicado en un índice unique
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

// Cuántos productos tienen cada vehículo como compatible: Map "marca|modelo" -> total
const contarProductosPorVehiculo = async () => {
    const filas = await Producto.aggregate([
        { $unwind: '$compatibilidad' },
        {
            $group: {
                _id: { marca: '$compatibilidad.marca', modelo: '$compatibilidad.modelo' },
                productos: { $addToSet: '$_id' }
            }
        },
        { $project: { total: { $size: '$productos' } } }
    ])

    const conteo = new Map()
    filas.forEach((f) => conteo.set(`${f._id.marca}|${f._id.modelo}`, f.total))
    return conteo
}

const getVehiculos = async (request, response) => {
    try {
        const [vehiculos, conteo] = await Promise.all([
            Vehiculo.find().sort({ marca: 1, modelo: 1 }).lean(),
            contarProductosPorVehiculo()
        ])

        response.json(vehiculos.map((v) => ({
            ...v,
            productos: conteo.get(`${v.marca}|${v.modelo}`) ?? 0
        })))
    } catch (e) {
        manejarError(e, response)
    }
}

const crearVehiculo = async (request, response) => {
    try {
        const { marca, modelo, desde, hasta } = request.body // destructuring
        const vehiculo = new Vehiculo({ marca, modelo, desde, hasta })
        await vehiculo.save()
        response.status(201).json(vehiculo)
    } catch (e) {
        manejarError(e, response)
    }
}

// Ajusta la compatibilidad de los productos a los nuevos años del vehículo:
// el rango de cada producto se recorta para no salirse del rango del catálogo y,
// si no queda ningún año en común, se quita el vehículo de ese producto.
// Si el catálogo se amplía, los productos no cambian.
const ajustarProductos = async (vehiculo, session) => {
    const { marca, modelo, desde, hasta } = vehiculo

    const productos = await Producto.find({
        compatibilidad: { $elemMatch: { marca, modelo } }
    }).session(session).lean()

    let compatibilidadesQuitadas = 0
    const operaciones = []

    productos.forEach((producto) => {
        let cambio = false
        const compatibilidad = []

        producto.compatibilidad.forEach((c) => {
            if (c.marca !== marca || c.modelo !== modelo) {
                compatibilidad.push(c)
                return
            }

            const nuevoDesde = Math.max(c.desde, desde)
            const nuevoHasta = Math.min(c.hasta, hasta)

            // Sin años en común: se quita el vehículo de este producto
            if (nuevoDesde > nuevoHasta) {
                compatibilidadesQuitadas++
                cambio = true
                return
            }

            if (nuevoDesde !== c.desde || nuevoHasta !== c.hasta) cambio = true
            compatibilidad.push({ ...c, desde: nuevoDesde, hasta: nuevoHasta })
        })

        if (cambio) {
            operaciones.push({
                updateOne: { filter: { _id: producto._id }, update: { $set: { compatibilidad } } }
            })
        }
    })

    if (operaciones.length > 0) await Producto.bulkWrite(operaciones, { session })

    return { productosAjustados: operaciones.length, compatibilidadesQuitadas }
}

// Solo se pueden cambiar los años: marca y modelo identifican al vehículo en los productos
const actualizarVehiculo = async (request, response) => {
    const session = await mongoose.startSession()
    try {
        const { id } = request.params
        if (!idValido(id, response)) return

        const { desde, hasta } = request.body
        if ((desde !== undefined && !Number.isInteger(desde)) || (hasta !== undefined && !Number.isInteger(hasta))) {
            return response.status(400).json({ message: 'Los años deben ser números enteros' })
        }

        const vehiculo = await Vehiculo.findById(id)
        if (!vehiculo) {
            return response.status(404).json({ message: 'Vehículo no encontrado' })
        }

        const anterior = { desde: vehiculo.desde, hasta: vehiculo.hasta }
        if (desde !== undefined) vehiculo.desde = desde
        if (hasta !== undefined) vehiculo.hasta = hasta

        // Mongoose solo valida los campos modificados, por eso se revisa el rango completo aquí
        if (vehiculo.desde > vehiculo.hasta) {
            return response.status(400).json({ message: 'El año final no puede ser menor al año inicial' })
        }
        await vehiculo.validate()

        const cambioAnios = vehiculo.desde !== anterior.desde || vehiculo.hasta !== anterior.hasta
        let ajuste = { productosAjustados: 0, compatibilidadesQuitadas: 0 }

        // El vehículo y los productos se actualizan juntos o no se actualiza nada
        await session.withTransaction(async () => {
            await Vehiculo.updateOne(
                { _id: vehiculo._id },
                { $set: { desde: vehiculo.desde, hasta: vehiculo.hasta } },
                { session }
            )
            ajuste = cambioAnios
                ? await ajustarProductos(vehiculo, session)
                : { productosAjustados: 0, compatibilidadesQuitadas: 0 }
        })

        response.json({ ...vehiculo.toObject(), ajuste })
    } catch (e) {
        manejarError(e, response)
    } finally {
        await session.endSession()
    }
}

const eliminarVehiculo = async (request, response) => {
    try {
        const { id } = request.params
        if (!idValido(id, response)) return

        const vehiculo = await Vehiculo.findById(id)
        if (!vehiculo) {
            return response.status(404).json({ message: 'Vehículo no encontrado' })
        }

        const enUso = await Producto.countDocuments({
            compatibilidad: { $elemMatch: { marca: vehiculo.marca, modelo: vehiculo.modelo } }
        })
        if (enUso > 0) {
            return response.status(409).json({
                message: `No se puede eliminar: ${enUso} ${enUso === 1 ? 'producto lo tiene' : 'productos lo tienen'} como compatible. Quítalo primero de ${enUso === 1 ? 'ese producto' : 'esos productos'}.`
            })
        }

        await vehiculo.deleteOne()
        response.json({ message: `Vehículo eliminado: ${vehiculo.marca} ${vehiculo.modelo}` })
    } catch (e) {
        manejarError(e, response)
    }
}

module.exports = {
    getVehiculos,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
}