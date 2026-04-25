import { connectDB, closeDB, clearDB } from './setup.js'
import request from 'supertest'
import app from '../src/app.js'

let token
let clientId
let projectId

beforeAll(async () => await connectDB())
afterAll(async () => await closeDB())
afterEach(async () => await clearDB())

beforeEach(async () => {
  const reg = await request(app)
    .post('/api/user/register')
    .send({ email: 'dn@bildyapp.com', password: 'password123' })
  token = reg.body.accessToken

  await request(app)
    .patch('/api/user/company')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Company', cif: 'B99999999', isFreelance: false })

  const client = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Cliente Test', cif: 'B12345678' })
  clientId = client.body.client._id

  const project = await request(app)
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client: clientId, name: 'Proyecto Test', projectCode: 'PROJ-001' })
  projectId = project.body.project._id
})

describe('Albaranes — POST /api/deliverynote', () => {
  it('debe crear un albarán de horas', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: clientId,
        project: projectId,
        format: 'hours',
        workDate: '2025-04-20',
        hours: 8
      })

    expect(res.status).toBe(201)
    expect(res.body.deliveryNote).toHaveProperty('_id')
    expect(res.body.deliveryNote.format).toBe('hours')
  })

  it('debe crear un albarán de material', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: clientId,
        project: projectId,
        format: 'material',
        workDate: '2025-04-20',
        material: 'Cemento',
        quantity: 50,
        unit: 'sacos'
      })

    expect(res.status).toBe(201)
    expect(res.body.deliveryNote.format).toBe('material')
  })

  it('debe rechazar formato inválido', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: clientId,
        project: projectId,
        format: 'invalido',
        workDate: '2025-04-20'
      })

    expect(res.status).toBe(400)
  })
})

describe('Albaranes — DELETE /api/deliverynote/:id', () => {
  it('debe eliminar un albarán no firmado', async () => {
    const created = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: clientId,
        project: projectId,
        format: 'hours',
        workDate: '2025-04-20',
        hours: 8
      })

    const id = created.body.deliveryNote._id

    const res = await request(app)
      .delete(`/api/deliverynote/${id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })
})

describe('Albaranes — GET /api/deliverynote', () => {
  it('debe listar albaranes con paginación', async () => {
    await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: clientId,
        project: projectId,
        format: 'hours',
        workDate: '2025-04-20',
        hours: 8
      })

    const res = await request(app)
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('deliveryNotes')
    expect(res.body).toHaveProperty('pagination')
  })
})