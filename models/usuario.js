const { Schema, model } = require('mongoose')

const UsuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Nombre requerido'],
        trim: true
    },
    correo: {
        type: String,
        required: [true, 'Correo requerido'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Correo inválido']
    },
    // Aquí se guarda el hash de la contraseña, nunca el texto original.
    // select: false hace que no venga en las consultas, salvo que se pida.
    clave: {
        type: String,
        required: [true, 'Clave requerida'],
        select: false
    },
    rol: {
        type: String,
        enum: {
            values: ['admin', 'operador'],
            message: 'El rol debe ser admin u operador'
        },
        default: 'operador'
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'fechaCreacion',
        updatedAt: 'fechaActualizacion'
    }
})

module.exports = model('Usuario', UsuarioSchema)