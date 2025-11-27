export const generateJobId = (): string => {
  // Generates a random alphanumeric string and takes 4 characters.
  // Using base 36 (0-9, a-z).
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};
