const { Schema, model } = require('mongoose')

const VehiculoSchema = new Schema({
    marca: {
        type: String,
        required: [true, 'Marca requerida'],
        trim: true
    },
    modelo: {
        type: String,
        required: [true, 'Modelo requerido'],
        trim: true
    },
    desde: {
        type: Number,
        required: [true, 'Año inicial requerido'],
        min: [1900, 'El año inicial no es válido']
    },
    hasta: {
        type: Number,
        required: [true, 'Año final requerido'],
        validate: {
            validator: function (valor) {
                return valor >= this.desde
            },
            message: 'El año final no puede ser menor al año inicial'
        }
    }
})

// No puede haber dos vehículos con la misma marca y modelo
VehiculoSchema.index({ marca: 1, modelo: 1 }, { unique: true })

module.exports = model('Vehiculo', VehiculoSchema)