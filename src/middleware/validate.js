// src/middleware/validate.js
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    })
    next()
  } catch (error) {
    if (error?.name === 'ZodError') {
      const issues = error.issues ?? []
      const errors = issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        code: 'VALIDATION_ERROR',
        details: errors,
      })
    }
    next(error)
  }
}