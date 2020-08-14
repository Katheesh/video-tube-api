module.exports = async (
  req,
  res,
  model,
  populates = [],
  status = '',
  or = []
) => {
  req.query.status = status

  const reqQuery = { ...req.query }

  const removeFields = ['select', 'sort', 'page', 'limit']
  removeFields.forEach((param) => delete reqQuery[param])

  let queryStr = JSON.stringify(reqQuery)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

  query = model.find(JSON.parse(queryStr))

  if (or) {
    query = query.or(or)
  }

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    query = query.sort({ createdAt: -1 })
    // '-createdAt'
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await model.countDocuments()
  const totalPage = Math.ceil(total / limit)

  if (parseInt(req.query.limit) !== 0) {
    query = query.skip(startIndex).limit(limit)
  }

  if (populates) {
    populates.forEach((populate) => {
      query = query.populate(populate)
    })
  }

  const results = await query

  // Pagination result
  const pagination = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  if (parseInt(req.query.limit) !== 0) {
    res.json({
      success: true,
      count: results.length,
      totalPage,
      pagination,
      data: results
    })
  } else {
    res.json({
      success: true,
      data: results
    })
  }
}
