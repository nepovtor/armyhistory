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
      this.db = { users: {}, payments: {} };
    }
    if (!this.db || typeof this.db.users !== 'object') throw new Error('Неверная структура базы');
    if (this.db.payments === undefined) this.db.payments = {};
    if (!this.db.payments || typeof this.db.payments !== 'object') throw new Error('Неверная структура платежей');
  }
  get(userId, story) {
    const user = this.db.users[userId];
    return user?.stories?.[story.id] ?? initialProgress(story);
  }
  put(userId, story, progress) {
    if (!this.db.users[userId]) this.db.users[userId] = { stories: {}, entitlements: {} };
    if (!this.db.users[userId].stories) this.db.users[userId].stories = {};
    this.db.users[userId].stories[story.id] = progress;
    this.save();
  }
  hasEntitlement(userId, product) {
    return Boolean(this.db.users[userId]?.entitlements?.[product]);
  }
  grantEntitlement(userId, product, payment) {
    const chargeId = payment?.telegramPaymentChargeId;
    if (!userId || !product || typeof chargeId !== 'string' || !chargeId) throw new Error('Неверные данные платежа');
    if (this.db.payments[chargeId]) return false;
    if (!this.db.users[userId]) this.db.users[userId] = { stories: {}, entitlements: {} };
    const user = this.db.users[userId];
    if (!user.stories) user.stories = {};
    if (!user.entitlements) user.entitlements = {};
    this.db.payments[chargeId] = { userId, product, ...payment };
    if (!user.entitlements[product]) user.entitlements[product] = { ...payment };
    this.save();
    return true;
  }
  save() {
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
