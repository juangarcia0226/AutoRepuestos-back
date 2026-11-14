const { Schema, model } = require('mongoose')

const MovimientoSchema = new Schema({
    tipo: {
        type: String,
        required: [true, 'Tipo de movimiento requerido'],
        enum: {
            values: ['entrada', 'salida'],
            message: 'El tipo debe ser entrada o salida'
        }
    },
    producto: {
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: [true, 'Producto requerido']
    },
    cantidad: {
        type: Number,
        required: [true, 'Cantidad requerida'],
        min: [1, 'La cantidad debe ser al menos 1']
    },
    // Por ahora es un texto; cuando exista el login se tomará del usuario autenticado
    usuario: {
        type: String,
        trim: true,
        default: 'Sistema'
    }
}, {
    // Un movimiento no se edita: solo interesa cuándo se creó
    timestamps: {
        createdAt: 'fechaCreacion',
        updatedAt: false
    }
})

module.exports = model('Movimiento', MovimientoSchema)