const parsePagination = (query = {}) => {
  const hasPaging = query.page !== undefined || query.limit !== undefined;
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = hasPaging ? Math.min(200, Math.max(1, parseInt(query.limit, 10) || 50)) : 500;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { parsePagination };
