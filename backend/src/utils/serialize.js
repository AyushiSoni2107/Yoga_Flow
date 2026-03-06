const toClient = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: String(obj._id),
    created_at: obj.createdAt,
    updated_at: obj.updatedAt,
  };
};

module.exports = { toClient };
