const tempUsers = new Map(); // sessionId -> { personalDetails, otp, verified, resendCount, expiresAt }

module.exports = {
  set: (sessionId, data) => tempUsers.set(sessionId, data),
  get: (sessionId) => tempUsers.get(sessionId),
  delete: (sessionId) => tempUsers.delete(sessionId),
  has: (sessionId) => tempUsers.has(sessionId),
  all: () => [...tempUsers.entries()]
};
