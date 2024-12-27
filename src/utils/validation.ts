export const validateAmount = (amount: string, coinValue: number): boolean => {
  const numericAmount = parseFloat(amount);
  return !isNaN(numericAmount) && numericAmount >= (coinValue * 2);
};

export const validatePasscode = (code: string): boolean => {
  if (code.length !== 52) return false;
  if (!code.startsWith('0xb1q')) return false;
  if (!code.endsWith('1b2t0z')) return false;
  return true;
};

export const extractKeywords = (code: string): string => {
  if (code.length < 52) return '';
  const positions = [5, 7, 11, 17, 21, 27, 30, 32];
  let result = '';
  positions.forEach(pos => {
    const char = code[pos];
    if (/[0-9]/.test(char)) {
      result += char;
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(char)) {
      result += '.';
    }
  });
  return result;
};