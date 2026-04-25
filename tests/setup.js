import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

process.env.JWT_SECRET = 'test_secret_key_para_jest'
process.env.JWT_EXPIRES_IN = '2h'
process.env.NODE_ENV = 'test'

let mongod

export const connectDB = async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
}

export const closeDB = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
}

export const clearDB = async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}