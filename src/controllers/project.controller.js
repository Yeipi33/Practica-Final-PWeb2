import Project from '../models/Project.js'
import Client from '../models/Client.js'
import AppError from '../utils/AppError.js'

//post /api/project
export const createProject = async (req, res, next) => {
  try {
    const { _id: userId, company } = req.user

    if (!company) return next(new AppError('Debes tener una compañía asociada', 400))

    const client = await Client.findOne({ _id: req.body.client, company, deleted: false })
    if (!client) return next(new AppError('Cliente no encontrado en tu compañía', 404))

    const exists = await Project.findOne({ projectCode: req.body.projectCode, company })
    if (exists) return next(new AppError('Ya existe un proyecto con ese código en tu compañía', 409))

    const project = await Project.create({
      ...req.body,
      user: userId,
      company
    })

    res.status(201).json({ ok: true, project })
  } catch (error) {
    next(error)
  }
}

//put /api/project/:id
export const updateProject = async (req, res, next) => {
  try {
    const { company } = req.user

    const project = await Project.findOne({ _id: req.params.id, company, deleted: false })
    if (!project) return next(new AppError('Proyecto no encontrado', 404))

    if (req.body.client) {
      const client = await Client.findOne({ _id: req.body.client, company, deleted: false })
      if (!client) return next(new AppError('Cliente no encontrado en tu compañía', 404))
    }

    if (req.body.projectCode && req.body.projectCode !== project.projectCode) {
      const exists = await Project.findOne({
        projectCode: req.body.projectCode,
        company,
        _id: { $ne: project._id }
      })
      if (exists) return next(new AppError('Ya existe un proyecto con ese código en tu compañía', 409))
    }

    Object.assign(project, req.body)
    await project.save()

    res.json({ ok: true, project })
  } catch (error) {
    next(error)
  }
}

//get /api/project
export const getProjects = async (req, res, next) => {
  try {
    const { company } = req.user
    const { page = 1, limit = 10, name, client, active, sort = '-createdAt' } = req.query

    const filter = { company, deleted: false }
    if (name)   filter.name   = { $regex: name, $options: 'i' }
    if (client) filter.client = client
    if (active !== undefined) filter.active = active === 'true'

    const skip = (Number(page) - 1) * Number(limit)
    const totalItems = await Project.countDocuments(filter)
    const totalPages = Math.ceil(totalItems / Number(limit))

    const projects = await Project.find(filter)
      .populate('client', 'name cif email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    res.json({
      ok: true,
      projects,
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

//get /api/project/:id
export const getProjectById = async (req, res, next) => {
  try {
    const { company } = req.user

    const project = await Project.findOne({ _id: req.params.id, company, deleted: false })
      .populate('client', 'name cif email')

    if (!project) return next(new AppError('Proyecto no encontrado', 404))

    res.json({ ok: true, project })
  } catch (error) {
    next(error)
  }
}

//delete /api/project/:id
export const deleteProject = async (req, res, next) => {
  try {
    const { company } = req.user
    const soft = req.query.soft === 'true'

    const project = await Project.findOne({ _id: req.params.id, company, deleted: false })
    if (!project) return next(new AppError('Proyecto no encontrado', 404))

    if (soft) {
      project.deleted = true
      project.active  = false
      await project.save()
      return res.json({ ok: true, message: 'Proyecto archivado correctamente' })
    }

    await project.deleteOne()
    res.json({ ok: true, message: 'Proyecto eliminado permanentemente' })
  } catch (error) {
    next(error)
  }
}

//get /api/project/archived
export const getArchivedProjects = async (req, res, next) => {
  try {
    const { company } = req.user

    const projects = await Project.find({ company, deleted: true })
      .populate('client', 'name cif email')

    res.json({ ok: true, projects })
  } catch (error) {
    next(error)
  }
}

//patch /api/project/:id/restore
export const restoreProject = async (req, res, next) => {
  try {
    const { company } = req.user

    const project = await Project.findOne({ _id: req.params.id, company, deleted: true })
    if (!project) return next(new AppError('Proyecto archivado no encontrado', 404))

    project.deleted = false
    project.active  = true
    await project.save()

    res.json({ ok: true, message: 'Proyecto restaurado correctamente', project })
  } catch (error) {
    next(error)
  }
}