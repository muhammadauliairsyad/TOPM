const Joi = require('@hapi/joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().min(1).required(),
  year: Joi.number().integer().required(),
}).options({
  allowUnknown: true,
  abortEarly: false,
  convert: false,
});

module.exports = { AlbumPayloadSchema };
