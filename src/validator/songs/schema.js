const Joi = require('@hapi/joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().min(1).required(),
  year: Joi.number().integer().required(),
  performer: Joi.string().min(1).required(),
codex/fix-mandatory-test-failures-hgja44
  genre: Joi.string().min(1).required(),
  duration: Joi.number().integer().optional(),
  albumId: Joi.string().min(1).optional(),
}).options({
  allowUnknown: true,
  abortEarly: false,
  convert: false,
=======
  genre: Joi.string().min(1).optional(),
  duration: Joi.number().integer().optional(),
  albumId: Joi.string().min(1).optional(),
main
});

module.exports = { SongPayloadSchema };
