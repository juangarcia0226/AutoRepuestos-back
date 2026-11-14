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
app.use(cors())
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

// arrancar el servidor en el puerto
app.listen(app.get('port'), () => {
    console.log('Servidor arriba en el puerto: ' + app.get('port'))
})