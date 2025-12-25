const nodemailer = require('nodemailer');
const config = require('../../utils/config');

class MailService {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });
  }

  async sendPlaylistExport(targetEmail, content) {
    await this._transporter.sendMail({
      from: config.smtp.user,
      to: targetEmail,
      subject: 'Export Playlist',
      text: 'Terlampir hasil ekspor playlist Anda.',
      attachments: [
        {
          filename: 'playlist.json',
          content: JSON.stringify(content, null, 2),
        },
      ],
    });
  }
}

module.exports = MailService;
