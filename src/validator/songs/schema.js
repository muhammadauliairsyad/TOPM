const Joi = require('@hapi/joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().min(1).required(),
  year: Joi.number().integer().required(),
  performer: Joi.string().min(1).required(),
  genre: Joi.string().min(1).optional(),
  duration: Joi.number().integer().optional(),
  albumId: Joi.string().min(1).optional(),
});

module.exports = { SongPayloadSchema };
