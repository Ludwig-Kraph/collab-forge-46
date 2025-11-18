export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const getCopyrightText = (): string => {
  return `© ${getCurrentYear()} M-Leja. All rights reserved.`;
};
