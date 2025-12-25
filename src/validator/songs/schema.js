const Joi = require('@hapi/joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  performer: Joi.string().required(),
  genre: Joi.string().optional(),
  duration: Joi.number().optional(),
  albumId: Joi.string().optional(),
});

module.exports = { SongPayloadSchema };
