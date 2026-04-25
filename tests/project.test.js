import { connectDB, closeDB, clearDB } from './setup.js'
import request from 'supertest'
import app from '../src/app.js'

let token
let clientId

beforeAll(async () => await connectDB())
afterAll(async () => await closeDB())
afterEach(async () => await clearDB())

beforeEach(async () => {
  const reg = await request(app)
    .post('/api/user/register')
    .send({ email: 'project@bildyapp.com', password: 'password123' })
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
})

describe('Proyectos — POST /api/project', () => {
  it('debe crear un proyecto correctamente', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ client: clientId, name: 'Proyecto Test', projectCode: 'PROJ-001' })

    expect(res.status).toBe(201)
    expect(res.body.project).toHaveProperty('_id')
  })

  it('debe rechazar código de proyecto duplicado', async () => {
    await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ client: clientId, name: 'Proyecto Test', projectCode: 'PROJ-001' })

    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ client: clientId, name: 'Otro Proyecto', projectCode: 'PROJ-001' })

    expect(res.status).toBe(409)
  })

  it('debe rechazar cliente inexistente', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ client: '000000000000000000000000', name: 'Proyecto Test', projectCode: 'PROJ-002' })

    expect(res.status).toBe(404)
  })
})

describe('Proyectos — GET /api/project', () => {
  it('debe listar proyectos con paginación', async () => {
    await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ client: clientId, name: 'Proyecto Test', projectCode: 'PROJ-001' })

    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('projects')
    expect(res.body).toHaveProperty('pagination')
  })
})