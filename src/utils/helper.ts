const formatVND = (money: string) => {
  const number = Number(money);
  if (isNaN(number)) {
    return "Invalid number";
  }
  return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const upPrice = (money: string) => {
  const number = Number(money);
  if (isNaN(number)) {
    return "Invalid number";
  }
  return (number + 50000).toString();
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const getLastFourChars = (input: any) => {
  return input ? input.slice(-4) : "";
};

const convertSpacesToDash = (input: string) => {
  return input?.trim()?.replace(/\s+/g, "-");
};

const calculateTotal = (money: string, ship: any, voucher: any) => {
  const number = Number(money);
  if (ship || voucher) {
    const money = Number(ship);
    const discount = (number + money) * (Number(voucher) / 100);
    const result = number + money - discount;
    return result.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
  if (isNaN(number)) {
    return "Invalid number";
  }
  return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const calculateTotalNumber = (money: string, ship: any, voucher: any) => {
  const number = Number(money);
  if (ship || voucher) {
    const money = Number(ship);
    const discount = (number + money) * (Number(voucher) / 100);
    const result = number + money - discount;
    return result;
  }
  if (isNaN(number)) {
    return "Invalid number";
  }
  return number;
};

export const HELPER = {
  formatVND,
  formatDate,
  getLastFourChars,
  convertSpacesToDash,
  upPrice,
  calculateTotal,
  calculateTotalNumber,
};
