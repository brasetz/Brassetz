// Simple currency conversion utility
export const convertUSDTtoINR = async (usdtAmount: string): Promise<number> => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    const inrRate = data.rates.INR;
    return parseFloat(usdtAmount) * inrRate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Fallback rate if API fails
    return parseFloat(usdtAmount) * 83;
  }
};