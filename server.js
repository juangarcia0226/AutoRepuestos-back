require('dotenv').config()
const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')

const swaggerSpec = require('./configurations/swagger')
const authRoutes = require('./routes/authRoutes')
const productoRoutes = require('./routes/productoRoutes')
const vehiculoRoutes = require('./routes/vehiculoRoutes')
const movimientoRoutes = require('./routes/movimientoRoutes')
const resumenRoutes = require('./routes/resumenRoutes')
const verificarToken = require('./middlewares/verificarToken')
const { mongoConnect } = require('./configurations/database')

if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en el archivo .env')
}

mongoConnect()

const app = express()

// asignar puerto
app.set('port', process.env.PORT || 5000)

// middlewares
const origenesPermitidos = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim())
app.use(cors({ origin: origenesPermitidos }))
app.use(express.json())

// documentación (pública)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// rutas públicas
app.use('/api/v1/auth', authRoutes)

// rutas protegidas: requieren token
app.use('/api/v1/productos', verificarToken, productoRoutes)
app.use('/api/v1/vehiculos', verificarToken, vehiculoRoutes)
app.use('/api/v1/movimientos', verificarToken, movimientoRoutes)
app.use('/api/v1/resumen', verificarToken, resumenRoutes)

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

// arrancar el servidor en el puerto
app.listen(app.get('port'), () => {
    console.log('Servidor arriba en el puerto: ' + app.get('port'))
})