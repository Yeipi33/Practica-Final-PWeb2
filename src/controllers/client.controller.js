import Client from '../models/Clients.js';
import { AppError } from '../utils/AppError.js';
import { io } from '../app.js'

//post /api/client
export const createClient = async (req, res, next) => {
    try{
        const { _id: userId, company} = req.user;

        if(!company) return next(new AppError('Debes tener una compañia asociada', 400));
        
        const exists = await Client.findOne({ cif: req.body.cif.toUpperCase(), company });
        if(exists) return next(new AppError('Ya existe un cliente con ese CIF en tu compañia', 409));

        const client = await Client.create({
            ...req.body,
            user: userId,
            company
        })

        io.to(`company:${company}`).emit('client:new', { client })

        res.status(201).json({ok: true, client})
    }catch(error){
        next(error);
    }
}

//Put /api/client/:id
export const updateClient = async (req, res, next) => {
    try{
        const {company} = req.user;

        const client = await Client.findOne({ _id: req.params.id, company, deleted: false })
        if (!client) return next(new AppError('Cliente no encontrado', 404))
        
        if (req.body.cif && req.body.cif.toUpperCase() !== client.cif) {
      const exists = await Client.findOne({
        cif: req.body.cif.toUpperCase(),
        company,
        _id: { $ne: client._id }
      })
      if (exists) return next(new AppError('Ya existe un cliente con ese CIF en tu compañía', 409))
    }
    Object.assign(client, req.body)
    await client.save()

    res.json({ ok: true, client })
    }catch(error){
        next(error);
    }
}

//get /api/client
export const getClients = async (req, res, next) => {
  try {
    const { company } = req.user
    const { page = 1, limit = 10, name, sort = 'createdAt' } = req.query

    const filter = { company, deleted: false }
    if (name) filter.name = { $regex: name, $options: 'i' }

    const skip = (Number(page) - 1) * Number(limit)
    const totalItems = await Client.countDocuments(filter)
    const totalPages = Math.ceil(totalItems / Number(limit))

    const clients = await Client.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    res.json({
      ok: true,
      clients,
      pagination: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

//get /api/client/:id
export const getClientById = async (req, res, next) => {
  try {
    const { company } = req.user

    const client = await Client.findOne({ _id: req.params.id, company, deleted: false })
    if (!client) return next(new AppError('Cliente no encontrado', 404))

    res.json({ ok: true, client })
  } catch (error) {
    next(error)
  }
}

//delete /api/client/:id
export const deleteClient = async (req, res, next) => {
  try {
    const { company } = req.user
    const soft = req.query.soft === 'true'

    const client = await Client.findOne({ _id: req.params.id, company, deleted: false })
    if (!client) return next(new AppError('Cliente no encontrado', 404))

    if (soft) {
      client.deleted = true
      await client.save()
      return res.json({ ok: true, message: 'Cliente archivado correctamente' })
    }

    await client.deleteOne()
    res.json({ ok: true, message: 'Cliente eliminado permanentemente' })
  } catch (error) {
    next(error)
  }
}

//get /api/client/archived
export const getArchivedClients = async (req, res, next) => {
  try {
    const { company } = req.user

    const clients = await Client.find({ company, deleted: true })

    res.json({ ok: true, clients })
  } catch (error) {
    next(error)
  }
}

//patch/api/client/:id/restore
export const restoreClient = async (req, res, next) => {
  try {
    const { company } = req.user

    const client = await Client.findOne({ _id: req.params.id, company, deleted: true })
    if (!client) return next(new AppError('Cliente archivado no encontrado', 404))

    client.deleted = false
    await client.save()

    res.json({ ok: true, message: 'Cliente restaurado correctamente', client })
  } catch (error) {
    next(error)
  }
}