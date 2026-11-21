const swaggerJsdoc = ({ definition }) => definition


/* ---------- Ayudas para no repetir ---------- */
const ref = (nombre) => ({ $ref: `#/components/schemas/${nombre}` })
const arreglo = (items) => ({ type: 'array', items })
const cuerpo = (nombre) => ({
    required: true,
    content: { 'application/json': { schema: ref(nombre) } }
})
const respuesta = (descripcion, schema) => ({
    description: descripcion,
    content: { 'application/json': { schema } }
})
const respuestaGlobal = (nombre) => ({ $ref: `#/components/responses/${nombre}` })
const parametroId = { $ref: '#/components/parameters/Id' }

/* ---------- Esquemas ---------- */
const compatibilidad = {
    type: 'object',
    required: ['marca', 'modelo', 'desde', 'hasta'],
    properties: {
        marca: { type: 'string', example: 'Chevrolet' },
        modelo: { type: 'string', example: 'Spark GT' },
        desde: { type: 'integer', example: 2010 },
        hasta: { type: 'integer', example: 2020 }
    }
}

const productoEntrada = {
    type: 'object',
    required: ['nombre', 'referencia', 'marca', 'categoria', 'precio'],
    properties: {
        nombre: { type: 'string', example: 'Filtro de aceite' },
        referencia: { type: 'string', example: 'MF-W712', description: 'Única; se guarda en mayúsculas' },
        marca: { type: 'string', example: 'Mann-Filter' },
        categoria: { type: 'string', example: 'Filtros' },
        stock: { type: 'integer', minimum: 0, default: 0, example: 24 },
        stockMinimo: { type: 'integer', minimum: 0, default: 0, example: 8 },
        precio: { type: 'number', minimum: 0, example: 32000 },
        ubicacion: { type: 'string', example: 'Pasillo A · Estante 2' },
        compatibilidad: arreglo(ref('Compatibilidad'))
    }
}

const schemas = {
    Error: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Producto no encontrado' } }
    },
    Compatibilidad: compatibilidad,
    ProductoEntrada: productoEntrada,
    Producto: {
        type: 'object',
        properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f708192a3b' },
            ...productoEntrada.properties,
            fechaCreacion: { type: 'string', format: 'date-time' },
            fechaActualizacion: { type: 'string', format: 'date-time' }
        }
    },
    ResultadoCompatible: {
        type: 'object',
        properties: {
            producto: ref('Producto'),
            compat: ref('Compatibilidad')
        }
    },
    Vehiculo: {
        type: 'object',
        required: ['marca', 'modelo', 'desde', 'hasta'],
        properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f708192a3c' },
            ...compatibilidad.properties,
            productos: { type: 'integer', readOnly: true, description: 'Productos que lo tienen como compatible', example: 4 },
            ajuste: {
                type: 'object',
                readOnly: true,
                description: 'Solo en la respuesta del PUT: resultado del ajuste de compatibilidad de los productos',
                properties: {
                    productosAjustados: { type: 'integer', example: 3 },
                    compatibilidadesQuitadas: { type: 'integer', example: 1 }
                }
            }
        }
    },
    VehiculoEdicion: {
        type: 'object',
        required: ['desde', 'hasta'],
        properties: {
            desde: { type: 'integer', example: 2010 },
            hasta: { type: 'integer', example: 2020 }
        }
    },
    MovimientoEntrada: {
        type: 'object',
        required: ['tipo', 'productoId', 'cantidad'],
        properties: {
            tipo: { type: 'string', enum: ['entrada', 'salida'], example: 'salida' },
            productoId: { type: 'string', description: 'Reemplázalo por el _id de un producto existente', example: '64f1a2b3c4d5e6f708192a3b' },
            cantidad: { type: 'integer', minimum: 1, example: 3 }
        }
    },
    Movimiento: {
        type: 'object',
        properties: {
            _id: { type: 'string' },
            tipo: { type: 'string', enum: ['entrada', 'salida'] },
            producto: { description: 'En el listado trae _id, nombre y referencia; al crear, solo el id' },
            cantidad: { type: 'integer' },
            usuario: { type: 'string', example: 'Administrador' },
            fechaCreacion: { type: 'string', format: 'date-time' }
        }
    },
    Resumen: {
        type: 'object',
        properties: {
            totalProductos: { type: 'integer', example: 12 },
            totalBajo: { type: 'integer', example: 3 },
            totalAgotados: { type: 'integer', example: 2 },
            alertas: arreglo({
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    nombre: { type: 'string' },
                    referencia: { type: 'string' },
                    marca: { type: 'string' },
                    stock: { type: 'integer' },
                    stockMinimo: { type: 'integer' }
                }
            })
        }
    },
    LoginEntrada: {
        type: 'object',
        required: ['correo', 'clave'],
        properties: {
            correo: { type: 'string', example: 'admin@autorepuestos.com' },
            clave: { type: 'string', example: '123456' }
        }
    },
    Usuario: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            nombre: { type: 'string', example: 'Administrador' },
            correo: { type: 'string', example: 'admin@autorepuestos.com' },
            rol: { type: 'string', enum: ['admin', 'operador'], example: 'admin' }
        }
    },
    UsuarioGestion: {
        type: 'object',
        properties: {
            _id: { type: 'string' },
            nombre: { type: 'string', example: 'Laura Pérez' },
            correo: { type: 'string', example: 'laura@autorepuestos.com' },
            rol: { type: 'string', enum: ['admin', 'operador'], example: 'operador' },
            activo: { type: 'boolean', example: true },
            fechaCreacion: { type: 'string', format: 'date-time' },
            fechaActualizacion: { type: 'string', format: 'date-time' }
        }
    },
    UsuarioCrear: {
        type: 'object',
        required: ['nombre', 'correo', 'clave'],
        properties: {
            nombre: { type: 'string', example: 'Laura Pérez' },
            correo: { type: 'string', example: 'laura@autorepuestos.com' },
            clave: { type: 'string', minLength: 6, example: 'laura123' },
            rol: { type: 'string', enum: ['admin', 'operador'], default: 'operador' }
        }
    },
    UsuarioEditar: {
        type: 'object',
        properties: {
            nombre: { type: 'string', example: 'Laura Pérez' },
            rol: { type: 'string', enum: ['admin', 'operador'] },
            activo: { type: 'boolean' },
            clave: { type: 'string', minLength: 6, description: 'Si se envía, restablece la contraseña del usuario' }
        }
    },
    CambioClave: {
        type: 'object',
        required: ['claveActual', 'claveNueva'],
        properties: {
            claveActual: { type: 'string', example: '123456' },
            claveNueva: { type: 'string', minLength: 6, example: 'nueva123' }
        }
    },
    LoginRespuesta: {
        type: 'object',
        properties: {
            token: { type: 'string' },
            usuario: ref('Usuario')
        }
    }
}

/* ---------- Rutas ---------- */
const paths = {
    '/api/v1/auth/login': {
        post: {
            tags: ['Auth'],
            summary: 'Iniciar sesión',
            security: [], // única ruta que no necesita token
            requestBody: cuerpo('LoginEntrada'),
            responses: {
                200: respuesta('Token y datos del usuario', ref('LoginRespuesta')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuesta('Correo o contraseña incorrectos', ref('Error')),
                403: respuesta('Usuario inactivo', ref('Error'))
            }
        }
    },
    '/api/v1/auth/perfil': {
        get: {
            tags: ['Auth'],
            summary: 'Usuario de la sesión actual',
            responses: {
                200: respuesta('Datos del usuario', ref('Usuario')),
                401: respuestaGlobal('NoAutorizado')
            }
        }
    },
    '/api/v1/auth/clave': {
        put: {
            tags: ['Auth'],
            summary: 'Cambiar la contraseña propia',
            requestBody: cuerpo('CambioClave'),
            responses: {
                200: respuesta('Contraseña actualizada', ref('Error')),
                400: respuesta('Datos inválidos o contraseña actual incorrecta', ref('Error')),
                401: respuestaGlobal('NoAutorizado')
            }
        }
    },
    '/api/v1/usuarios': {
        get: {
            tags: ['Usuarios'],
            summary: 'Listar usuarios (solo administradores)',
            responses: {
                200: respuesta('Usuarios ordenados por nombre', arreglo(ref('UsuarioGestion'))),
                401: respuestaGlobal('NoAutorizado'),
                403: respuestaGlobal('Prohibido')
            }
        },
        post: {
            tags: ['Usuarios'],
            summary: 'Crear un usuario (solo administradores)',
            requestBody: cuerpo('UsuarioCrear'),
            responses: {
                201: respuesta('Usuario creado', ref('UsuarioGestion')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                403: respuestaGlobal('Prohibido'),
                409: respuestaGlobal('Conflicto')
            }
        }
    },
    '/api/v1/usuarios/{id}': {
        put: {
            tags: ['Usuarios'],
            summary: 'Actualizar un usuario (solo administradores)',
            description: 'Permite cambiar nombre, rol, estado y clave; el correo no se modifica. Un administrador no puede quitarse el rol ni desactivarse a sí mismo.',
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del usuario' }
            ],
            requestBody: cuerpo('UsuarioEditar'),
            responses: {
                200: respuesta('Usuario actualizado', ref('UsuarioGestion')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                403: respuestaGlobal('Prohibido'),
                404: respuestaGlobal('NoEncontrado')
            }
        },
        delete: {
            tags: ['Usuarios'],
            summary: 'Eliminar un usuario (solo administradores)',
            description: 'Un administrador no puede eliminar su propia cuenta.',
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del usuario' }
            ],
            responses: {
                200: respuesta('Usuario eliminado', ref('Error')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                403: respuestaGlobal('Prohibido'),
                404: respuestaGlobal('NoEncontrado')
            }
        }
    },
    '/api/v1/productos': {
        get: {
            tags: ['Productos'],
            summary: 'Listar productos',
            responses: {
                200: respuesta('Productos ordenados por nombre', arreglo(ref('Producto'))),
                401: respuestaGlobal('NoAutorizado')
            }
        },
        post: {
            tags: ['Productos'],
            summary: 'Crear un producto',
            requestBody: cuerpo('ProductoEntrada'),
            responses: {
                201: respuesta('Producto creado', ref('Producto')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                409: respuestaGlobal('Conflicto')
            }
        }
    },
    '/api/v1/productos/compatibles': {
        get: {
            tags: ['Productos'],
            summary: 'Repuestos compatibles con un vehículo',
            description: 'Los productos agotados aparecen al final.',
            parameters: [
                { name: 'marca', in: 'query', required: true, schema: { type: 'string' }, example: 'Chevrolet' },
                { name: 'modelo', in: 'query', required: true, schema: { type: 'string' }, example: 'Spark GT' },
                { name: 'anio', in: 'query', required: true, schema: { type: 'integer' }, example: 2018 }
            ],
            responses: {
                200: respuesta('Lista de compatibles (puede estar vacía)', arreglo(ref('ResultadoCompatible'))),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado')
            }
        }
    },
    '/api/v1/productos/{id}': {
        get: {
            tags: ['Productos'],
            summary: 'Obtener un producto por id',
            parameters: [parametroId],
            responses: {
                200: respuesta('Producto', ref('Producto')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                404: respuestaGlobal('NoEncontrado')
            }
        },
        put: {
            tags: ['Productos'],
            summary: 'Actualizar un producto',
            description: 'Acepta campos sueltos: solo se actualizan los que se envíen.',
            parameters: [parametroId],
            requestBody: cuerpo('ProductoEntrada'),
            responses: {
                200: respuesta('Producto actualizado', ref('Producto')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                404: respuestaGlobal('NoEncontrado'),
                409: respuestaGlobal('Conflicto')
            }
        },
        delete: {
            tags: ['Productos'],
            summary: 'Eliminar un producto',
            parameters: [parametroId],
            responses: {
                200: respuesta('Producto eliminado', ref('Error')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                404: respuestaGlobal('NoEncontrado')
            }
        }
    },
    '/api/v1/vehiculos': {
        get: {
            tags: ['Vehículos'],
            summary: 'Listar vehículos',
            responses: {
                200: respuesta('Vehículos ordenados por marca y modelo', arreglo(ref('Vehiculo'))),
                401: respuestaGlobal('NoAutorizado')
            }
        },
        post: {
            tags: ['Vehículos'],
            summary: 'Crear un vehículo',
            requestBody: cuerpo('Vehiculo'),
            responses: {
                201: respuesta('Vehículo creado', ref('Vehiculo')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                409: respuestaGlobal('Conflicto')
            }
        }
    },
    '/api/v1/vehiculos/{id}': {
        put: {
            tags: ['Vehículos'],
            summary: 'Actualizar los años de un vehículo',
            description: 'Solo se pueden cambiar los años. Si el rango se reduce, la compatibilidad de los productos se recorta al nuevo rango, y se quita el vehículo de los productos que queden sin años en común. Si se amplía, los productos no cambian. El vehículo y los productos se actualizan en una transacción.',
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del vehículo' }
            ],
            requestBody: cuerpo('VehiculoEdicion'),
            responses: {
                200: respuesta('Vehículo actualizado', ref('Vehiculo')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                404: respuestaGlobal('NoEncontrado')
            }
        },
        delete: {
            tags: ['Vehículos'],
            summary: 'Eliminar un vehículo',
            description: 'No se puede eliminar si algún producto lo tiene como compatible.',
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del vehículo' }
            ],
            responses: {
                200: respuesta('Vehículo eliminado', ref('Error')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                404: respuestaGlobal('NoEncontrado'),
                409: respuesta('El vehículo está en uso por productos', ref('Error'))
            }
        }
    },
    '/api/v1/movimientos': {
        get: {
            tags: ['Movimientos'],
            summary: 'Últimos movimientos de stock',
            parameters: [
                { name: 'limite', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 } }
            ],
            responses: {
                200: respuesta('Movimientos del más reciente al más antiguo', arreglo(ref('Movimiento'))),
                401: respuestaGlobal('NoAutorizado')
            }
        },
        post: {
            tags: ['Movimientos'],
            summary: 'Registrar una entrada o salida de stock',
            description: 'Actualiza el stock del producto. Una salida no puede dejarlo en negativo.',
            requestBody: cuerpo('MovimientoEntrada'),
            responses: {
                201: respuesta('Movimiento registrado', ref('Movimiento')),
                400: respuestaGlobal('DatosInvalidos'),
                401: respuestaGlobal('NoAutorizado'),
                404: respuestaGlobal('NoEncontrado'),
                409: respuesta('Stock insuficiente', ref('Error'))
            }
        }
    },
    '/api/v1/resumen': {
        get: {
            tags: ['Resumen'],
            summary: 'Totales y alertas del inventario',
            responses: {
                200: respuesta('Resumen para el Dashboard', ref('Resumen')),
                401: respuestaGlobal('NoAutorizado')
            }
        }
    }
}

/* ---------- Especificación ---------- */
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API AutoRepuestos',
            version: '1.0.0',
            description: 'API REST del sistema de gestión de inventario de AutoRepuestos. Los usuarios con rol operador no pueden crear, editar ni eliminar productos o vehículos (responde 403); la gestión de usuarios es solo para administradores.'
        },
         // Relativa: usa la dirección desde la que se abre la documentación (local o desplegada)
        servers: [{ url: '/' }],
        tags: [
            { name: 'Auth' },
            { name: 'Productos' },
            { name: 'Vehículos' },
            { name: 'Movimientos' },
            { name: 'Resumen' },
            { name: 'Usuarios' }
        ],
        // Todas las rutas piden token, salvo las que lo indiquen (login)
        security: [{ bearerAuth: [] }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            },
            parameters: {
                Id: { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del producto' }
            },
            responses: {
                DatosInvalidos: respuesta('Datos inválidos', ref('Error')),
                NoAutorizado: respuesta('Token requerido, inválido o expirado', ref('Error')),
                NoEncontrado: respuesta('No encontrado', ref('Error')),
                Conflicto: respuesta('Valor duplicado', ref('Error')),
                Prohibido: respuesta('Sin permiso para esta acción', ref('Error'))
            },
            schemas
        },
        paths
    },
    apis: [] // la documentación está en este archivo, no en comentarios de las rutas
})

module.exports = swaggerSpec