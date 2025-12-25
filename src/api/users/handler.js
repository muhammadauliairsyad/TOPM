const { nanoid } = require('nanoid');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    // Validasi wajib: username, password, fullname
    this._validator.validateUserPayload(request.payload);

    const { username, password, fullname } = request.payload;

    // Cek user sudah ada (berdasarkan username)
    const isExisting = await this._service.isUsernameTaken(username);
    if (isExisting) {
      return h
        .response({
          status: 'fail',
          message: 'Gagal menambahkan user. Username sudah digunakan',
        })
        .code(400);
    }

    const userId = `user-${nanoid(16)}`;

    // Simpan user baru
    await this._service.addUser({
      userId,
      username,
      password,
      fullname,
    });

    return h
      .response({
        status: 'success',
        data: { userId },
      })
      .code(201);
  }
}

module.exports = UsersHandler;
