const rateLimit = require('express-rate-limit')

// Frena los intentos masivos de contraseñas: máximo 10 intentos fallidos
// por IP cada 15 minutos. Los inicios de sesión correctos no cuentan.
const limitarLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        message: 'Demasiados intentos fallidos. Inténtalo de nuevo en unos minutos.'
    }
})

module.exports = limitarLogin