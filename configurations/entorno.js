// Debe cargarse después de dotenv.config()
const esProduccion = process.env.NODE_ENV === 'production'

// Revisa las variables críticas; en producción es más estricto para evitar errores peligrosos
const validarEntorno = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('Falta JWT_SECRET en las variables de entorno')
    }
    if (!process.env.MONGO_URI) {
        throw new Error('Falta MONGO_URI en las variables de entorno')
    }

    if (esProduccion) {
        const faltantes = ['CORS_ORIGIN', 'MONGO_DB'].filter((nombre) => !process.env[nombre])
        if (faltantes.length > 0) {
            throw new Error(`Faltan variables de entorno en producción: ${faltantes.join(', ')}`)
        }
        if (process.env.JWT_SECRET.length < 32) {
            throw new Error('En producción, JWT_SECRET debe tener al menos 32 caracteres')
        }
    }
}

module.exports = {
    esProduccion,
    validarEntorno
}