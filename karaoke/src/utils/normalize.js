export function normalizeOrders(orders, type = "fnb") {
  const map = new Map();

  orders.forEach((item) => {
    const name = type === "fnb" ? item.fnb.name : item.lady.name;
    const qty = Number(item.quantity);
    const total = Number(item.totalAmount);

    if (map.has(name)) {
      const existing = map.get(name);
      map.set(name, {
        ...existing,
        quantity: existing.quantity + qty,
        totalAmount: Number(existing.totalAmount) + total,
      });
    } else {
      map.set(name, { name, quantity: qty, totalAmount: total });
    }
  });

  return Array.from(map.values());
}
