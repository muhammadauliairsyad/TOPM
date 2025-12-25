const pool = require('./pool');
const { nanoid } = require('nanoid');
const InvariantError = require('../../utils/invariantError');

class PlaylistSongActivitiesService {
  async addActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const result = await pool.query({
      text: `
        INSERT INTO playlist_song_activities
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      values: [id, playlistId, songId, userId, action, time],
    });

    if (!result.rowCount) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }
  }

  async getActivities(playlistId) {
    const result = await pool.query({
      text: `
        SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
        FROM playlist_song_activities
        JOIN users ON users.id = playlist_song_activities.user_id
        JOIN songs ON songs.id = playlist_song_activities.song_id
        WHERE playlist_song_activities.playlist_id = $1
        ORDER BY playlist_song_activities.time ASC
      `,
      values: [playlistId],
    });

    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
