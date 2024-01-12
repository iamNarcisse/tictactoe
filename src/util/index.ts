export const generateRoom = (length = 4) => {
  const code = Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, '0');
  return `ER${code}`;
};
