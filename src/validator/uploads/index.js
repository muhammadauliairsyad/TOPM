const InvariantError = require('../../utils/invariantError');
const { ImageHeadersSchema } = require('./schema');

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
    const contentType = headers['content-type'];
    if (!contentType.startsWith('image/')) {
      throw new InvariantError('Tipe file harus berupa gambar');
    }
  },
};

module.exports = UploadsValidator;
