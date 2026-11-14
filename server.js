require('dotenv').config()
const express = require('express')
const cors = require('cors')

const productoRoutes = require('./routes/productoRoutes')
const vehiculoRoutes = require('./routes/vehiculoRoutes')
const movimientoRoutes = require('./routes/movimientoRoutes')
const { mongoConnect } = require('./configurations/database')

mongoConnect()

const app = express()

// asignar puerto
app.set('port', process.env.PORT || 5000)

// middlewares
app.use(cors())
app.use(express.json())
app.use('/api/v1/productos', productoRoutes)
app.use('/api/v1/vehiculos', vehiculoRoutes)
app.use('/api/v1/movimientos', movimientoRoutes)

// arrancar el servidor en el puerto
app.listen(app.get('port'), () => {
    console.log('Servidor arriba en el puerto: ' + app.get('port'))
})