const Joi = require('@hapi/joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().min(1).required(),
  year: Joi.number().integer().required(),
codex/fix-mandatory-test-failures-hgja44
}).options({
  allowUnknown: true,
  abortEarly: false,
  convert: false,
=======
main
});

module.exports = { AlbumPayloadSchema };
