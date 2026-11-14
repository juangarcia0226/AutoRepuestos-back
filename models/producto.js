const { Schema, model } = require('mongoose')

const ProductoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Nombre requerido'],
        trim: true,
        minLength: [2, 'El nombre debe tener al menos 2 caracteres']
    },
    referencia: {
        type: String,
        required: [true, 'Referencia requerida'],
        unique: true,
        trim: true,
        uppercase: true
    },
    marca: {
        type: String,
        required: [true, 'Marca requerida'],
        trim: true
    },
    categoria: {
        type: String,
        required: [true, 'Categoría requerida'],
        trim: true
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock no puede ser negativo']
    },
    stockMinimo: {
        type: Number,
        default: 0,
        min: [0, 'El stock mínimo no puede ser negativo']
    },
    precio: {
        type: Number,
        required: [true, 'Precio requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    ubicacion: {
        type: String,
        trim: true
    }
}, {
    // Mongoose llena las fechas automáticamente al crear y al actualizar
    timestamps: {
        createdAt: 'fechaCreacion',
        updatedAt: 'fechaActualizacion'
    }
})

module.exports = model('Producto', ProductoSchema)