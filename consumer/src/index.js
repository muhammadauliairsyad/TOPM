const PlaylistsService = require('./services/postgres/PlaylistsService');
const MailService = require('./services/mail/MailService');
const ConsumerService = require('./services/rabbitmq/ConsumerService');

const init = async () => {
  const playlistsService = new PlaylistsService();
  const mailService = new MailService();
  const consumerService = new ConsumerService();

  await consumerService.consume(async (message) => {
    const { playlistId, targetEmail } = JSON.parse(message.content.toString());
    const exportData = await playlistsService.getPlaylistExport(playlistId);

    if (exportData) {
      await mailService.sendPlaylistExport(targetEmail, exportData);
    }
  });
};

init();
