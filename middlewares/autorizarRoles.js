// Permite el paso solo a los roles indicados. Debe ir después de verificarToken.
const autorizarRoles = (...roles) => (request, response, next) => {
    if (!roles.includes(request.usuario?.rol)) {
        return response.status(403).json({
            message: 'No tienes permiso para realizar esta acción'
        })
    }
    next()
}

module.exports = autorizarRoles