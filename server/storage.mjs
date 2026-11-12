import fs from 'node:fs';
import path from 'node:path';
import { initialProgress } from './engine.mjs';

export class Storage {
  constructor(dir) {
    fs.mkdirSync(dir, { recursive: true });
    this.file = path.join(dir, 'progress.json');
    try { this.db = JSON.parse(fs.readFileSync(this.file, 'utf8')); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error; // не перетирать повреждённую базу
      this.db = { users: {} };
    }
    if (!this.db || typeof this.db.users !== 'object') throw new Error('Неверная структура базы');
  }
  get(userId, story) {
    const user = this.db.users[userId];
    return user?.stories?.[story.id] ?? initialProgress(story);
  }
  put(userId, story, progress) {
    if (!this.db.users[userId]) this.db.users[userId] = { stories: {} };
    this.db.users[userId].stories[story.id] = progress;
    const tmp = `${this.file}.${process.pid}.tmp`;
    try {
      fs.writeFileSync(tmp, JSON.stringify(this.db, null, 2), { mode: 0o600 });
      fs.renameSync(tmp, this.file);
    } catch (e) {
      try { fs.unlinkSync(tmp); } catch { /* ignore */ }
      throw e;
    }
  }
}
