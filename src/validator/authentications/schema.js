const Joi = require('@hapi/joi');

const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().min(1).required(),
  password: Joi.string().min(1).required(),
}).options({
  allowUnknown: true,
  abortEarly: false,
  convert: false,
});

const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().min(1).required(),
}).options({
  allowUnknown: true,
  abortEarly: false,
  convert: false,
});

const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().min(1).required(),
}).options({
  allowUnknown: true,
  abortEarly: false,
  convert: false,
});

module.exports = {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
};
