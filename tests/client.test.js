import { connectDB, closeDB, clearDB } from './setup.js'
import request from 'supertest'
import app from '../src/app.js'

let token
let companyId

beforeAll(async () => await connectDB())
afterAll(async () => await closeDB())
afterEach(async () => await clearDB())

beforeEach(async () => {
  // Registrar usuario
  const reg = await request(app)
    .post('/api/user/register')
    .send({ email: 'client@bildyapp.com', password: 'password123' })
  token = reg.body.accessToken

  // Crear compañía
  const comp = await request(app)
    .patch('/api/user/company')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Company', cif: 'B99999999', isFreelance: false })
  companyId = comp.body.company?._id
})

describe('Clientes — POST /api/client', () => {
  it('debe crear un cliente correctamente', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Test', cif: 'B12345678' })

    expect(res.status).toBe(201)
    expect(res.body.client).toHaveProperty('_id')
    expect(res.body.client.name).toBe('Cliente Test')
  })

  it('debe rechazar CIF duplicado', async () => {
    await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Test', cif: 'B12345678' })

    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Otro Cliente', cif: 'B12345678' })

    expect(res.status).toBe(409)
  })

  it('debe rechazar sin token', async () => {
    const res = await request(app)
      .post('/api/client')
      .send({ name: 'Cliente Test', cif: 'B12345678' })

    expect(res.status).toBe(401)
  })
})

describe('Clientes — GET /api/client', () => {
  it('debe listar clientes con paginación', async () => {
    await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Test', cif: 'B12345678' })

    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('clients')
    expect(res.body).toHaveProperty('pagination')
  })
})

describe('Clientes — DELETE /api/client/:id', () => {
  it('debe archivar un cliente con soft delete', async () => {
    const created = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Test', cif: 'B12345678' })

    const id = created.body.client._id

    const res = await request(app)
      .delete(`/api/client/${id}?soft=true`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/archivado/i)
  })
})