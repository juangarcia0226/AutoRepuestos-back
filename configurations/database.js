const mongoose = require('mongoose')

const mongoConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB || 'autorepuestos',
            // Falla en 10 s, en lugar de esperar 30 s, si Atlas no responde
            serverSelectionTimeoutMS: 10000
        })
        console.log('Conectado a Mongo!!!')
    } catch (e) {
        console.error(e)
        throw new Error('Error al conectar con mongo')
    }
}

module.exports = {
    mongoConnect
}