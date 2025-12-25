const Joi = require('@hapi/joi');

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().required(),
}).unknown();

module.exports = { ImageHeadersSchema };
