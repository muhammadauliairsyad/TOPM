const Joi = require('@hapi/joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().min(1).required(),
  password: Joi.string().min(1).required(),
  fullname: Joi.string().min(1).required(),
}).options({
  allowUnknown: true,
  abortEarly: false,
  convert: false,
});

module.exports = { UserPayloadSchema };
