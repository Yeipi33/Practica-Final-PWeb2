import request from 'supertest'
import app from '../src/app.js'
import { connectDB, closeDB, clearDB } from './setup.js'

beforeAll(async () => await connectDB())
afterAll(async () => await closeDB())
afterEach(async () => await clearDB())

describe('Auth — POST /api/user/register', () => {
  it('debe registrar un usuario correctamente', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'test@bildyapp.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('accessToken')
  })

  it('debe rechazar un email inválido', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'no-es-email', password: 'password123' })

    expect(res.status).toBe(400)
  })

  it('debe rechazar contraseña menor de 8 caracteres', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'test2@bildyapp.com', password: '123' })

    expect(res.status).toBe(400)
  })

  it('debe rechazar email duplicado', async () => {
    await request(app)
      .post('/api/user/register')
      .send({ email: 'dup@bildyapp.com', password: 'password123' })

    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'dup@bildyapp.com', password: 'password123' })

    expect(res.status).toBe(409)
  })
})

describe('Auth — POST /api/user/login', () => {
  it('debe hacer login correctamente', async () => {
    await request(app)
      .post('/api/user/register')
      .send({ email: 'login@bildyapp.com', password: 'password123' })

    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'login@bildyapp.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
  })

  it('debe rechazar contraseña incorrecta', async () => {
    await request(app)
      .post('/api/user/register')
      .send({ email: 'login2@bildyapp.com', password: 'password123' })

    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'login2@bildyapp.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })
})