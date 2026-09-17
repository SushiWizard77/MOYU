const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isYesterday = (a, b) => {
  const yesterday = new Date(b);
  yesterday.setDate(b.getDate() - 1);
  return isSameDay(a, yesterday);
};

const registerActivityForStreak = async (user) => {
  const today = new Date();
  const last = user.streak?.lastActiveDate ? new Date(user.streak.lastActiveDate) : null;

  if (last && isSameDay(last, today)) {
    return user;
  }

  let current = 1;
  if (last && isYesterday(last, today)) {
    current = (user.streak?.current || 0) + 1;
  }

  user.streak = {
    current,
    longest: Math.max(current, user.streak?.longest || 0),
    lastActiveDate: today,
  };

  await user.save();
  return user;
};

module.exports = { registerActivityForStreak };
