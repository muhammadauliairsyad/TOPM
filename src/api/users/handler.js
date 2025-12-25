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

    // Simpan user baru
    const userId = await this._service.addUser({ username, password, fullname });

    return h
      .response({
        status: 'success',
        data: { userId },
      })
      .code(201);
  }
}

module.exports = UsersHandler;
