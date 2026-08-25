export const filterNumber = (value) => {
  // ambil hanya digit
  const digitsOnly = value.replace(/\D/g, "");
  const newNumber = digitsOnly ? parseInt(digitsOnly, 10) : 0;
  return newNumber;
};

export const formatRp = (value = 0) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};
