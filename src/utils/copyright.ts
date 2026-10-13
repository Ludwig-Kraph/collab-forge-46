export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const getCopyrightText = (): string => {
  return `© ${getCurrentYear()} Al Yasir Bin Zayed. M-Leja is developed and maintained by Al Yasir Bin Zayed.`;
};
