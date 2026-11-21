require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoose = require('mongoose')
const swaggerUi = require('swagger-ui-express')

const swaggerSpec = require('./configurations/swagger')
const authRoutes = require('./routes/authRoutes')
const usuarioRoutes = require('./routes/usuarioRoutes')
const productoRoutes = require('./routes/productoRoutes')
const vehiculoRoutes = require('./routes/vehiculoRoutes')
const movimientoRoutes = require('./routes/movimientoRoutes')
const resumenRoutes = require('./routes/resumenRoutes')
const verificarToken = require('./middlewares/verificarToken')
const autorizarRoles = require('./middlewares/autorizarRoles')
const { mongoConnect } = require('./configurations/database')
const { validarEntorno } = require('./configurations/entorno')

validarEntorno()

const app = express()

// Detrás de un proxy (como Render) hay que indicar cuántos saltos confiar,
// para que el límite de intentos vea la IP real del cliente
if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY))
}

// asignar puerto
app.set('port', process.env.PORT || 5000)

// middlewares
const origenesPermitidos = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim())
app.use(cors({ origin: origenesPermitidos }))
app.use(express.json())

// documentación (pública, se puede apagar con DOCS_PUBLICAS=false);
// va antes de helmet para que su política de contenido no afecte a Swagger UI
if (process.env.DOCS_PUBLICAS !== 'false') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

// encabezados de seguridad para el resto de la API
app.use(helmet())

// ruta de salud (pública): sirve para comprobar que el servicio y la base de datos responden
app.get('/api/v1/salud', (request, response) => {
    const baseDeDatos = mongoose.connection.readyState === 1
    response.status(baseDeDatos ? 200 : 503).json({
        estado: baseDeDatos ? 'ok' : 'sin conexión a la base de datos'
    })
})

// rutas públicas
app.use('/api/v1/auth', authRoutes)

// rutas protegidas: requieren token
app.use('/api/v1/productos', verificarToken, productoRoutes)
app.use('/api/v1/vehiculos', verificarToken, vehiculoRoutes)
app.use('/api/v1/movimientos', verificarToken, movimientoRoutes)
app.use('/api/v1/resumen', verificarToken, resumenRoutes)

// gestión de usuarios: solo administradores
app.use('/api/v1/usuarios', verificarToken, autorizarRoles('admin'), usuarioRoutes)

// ruta inexistente
app.use((request, response) => {
    response.status(404).json({
        message: 'Ruta no encontrada'
    })
})

// errores no controlados (por ejemplo, un JSON mal formado en el body)
app.use((err, request, response, next) => {
    if (err.type === 'entity.parse.failed') {
        return response.status(400).json({
            message: 'El cuerpo de la petición no es un JSON válido'
        })
    }
    console.error(err)
    response.status(500).json({
        message: 'Error general'
    })
})

// El servidor solo empieza a escuchar cuando la base de datos está conectada
const iniciar = async () => {
    try {
        await mongoConnect()
        app.listen(app.get('port'), () => {
            console.log('Servidor arriba en el puerto: ' + app.get('port'))
        })
    } catch (e) {
        console.error('No se pudo iniciar el servidor')
        process.exit(1)
    }
}

iniciar()