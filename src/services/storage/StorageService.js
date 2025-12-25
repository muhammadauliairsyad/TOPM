const fs = require('fs');
const path = require('path');
const config = require('../../utils/config');

class StorageService {
  constructor() {
    this._basePath = config.storage.localPath;
    if (!fs.existsSync(this._basePath)) {
      fs.mkdirSync(this._basePath, { recursive: true });
    }
  }

  async writeFile(file, filename) {
    const filepath = path.join(this._basePath, filename);
    const fileStream = fs.createWriteStream(filepath);

    return new Promise((resolve, reject) => {
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
      file.on('error', (error) => reject(error));
    });
  }

  getFileUrl(filename) {
    return `${config.storage.baseUrl}/uploads/covers/${filename}`;
  }
}

module.exports = StorageService;
