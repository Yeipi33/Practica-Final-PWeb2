import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BildyApp API',
      version: '1.0.0',
      description: 'API REST para gestión de albaranes de obra'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor local' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Client: {
          type: 'object',
          properties: {
            _id:     { type: 'string', example: '664a1b2c3d4e5f6789012345' },
            name:    { type: 'string', example: 'Constructora López S.L.' },
            cif:     { type: 'string', example: 'B12345678' },
            email:   { type: 'string', example: 'lopez@constructora.com' },
            phone:   { type: 'string', example: '600123456' },
            address: { $ref: '#/components/schemas/Address' },
            deleted: { type: 'boolean', example: false }
          }
        },
        Project: {
          type: 'object',
          properties: {
            _id:         { type: 'string', example: '664a1b2c3d4e5f6789012346' },
            name:        { type: 'string', example: 'Reforma Oficinas Centro' },
            projectCode: { type: 'string', example: 'PROJ-001' },
            client:      { type: 'string', example: '664a1b2c3d4e5f6789012345' },
            email:       { type: 'string', example: 'obra@lopez.com' },
            notes:       { type: 'string', example: 'Acceso por puerta trasera' },
            active:      { type: 'boolean', example: true },
            deleted:     { type: 'boolean', example: false }
          }
        },
        DeliveryNote: {
          type: 'object',
          properties: {
            _id:         { type: 'string', example: '664a1b2c3d4e5f6789012347' },
            format:      { type: 'string', enum: ['material', 'hours'] },
            description: { type: 'string', example: 'Instalación eléctrica' },
            workDate:    { type: 'string', format: 'date', example: '2025-04-20' },
            material:    { type: 'string', example: 'Cemento Portland' },
            quantity:    { type: 'number', example: 50 },
            unit:        { type: 'string', example: 'sacos' },
            hours:       { type: 'number', example: 8 },
            signed:      { type: 'boolean', example: false },
            signatureUrl:{ type: 'string', example: 'https://res.cloudinary.com/...' },
            pdfUrl:      { type: 'string', example: 'https://res.cloudinary.com/...' }
          }
        },
        Address: {
          type: 'object',
          properties: {
            street:   { type: 'string', example: 'Calle Mayor' },
            number:   { type: 'string', example: '10' },
            postal:   { type: 'string', example: '28001' },
            city:     { type: 'string', example: 'Madrid' },
            province: { type: 'string', example: 'Madrid' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error:   { type: 'boolean', example: true },
            message: { type: 'string', example: 'Mensaje de error' },
            code:    { type: 'string', example: 'ERROR_CODE' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            totalItems:  { type: 'integer', example: 25 },
            totalPages:  { type: 'integer', example: 3 },
            currentPage: { type: 'integer', example: 1 },
            limit:       { type: 'integer', example: 10 }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
}

export default swaggerJsdoc(options)