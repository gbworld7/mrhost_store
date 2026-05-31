// Единый стиль стора (из лендинга/фронта): чёрный / белый / золото.
export const T = {
  ink: "#111111", white: "#FFFFFF", page: "#F8F7F3",
  gold: "#C5A059", goldDeep: "#C19615", goldSoft: "#F9F3E5",
  orange: "#FF4D00", blue: "#42AAFF", star: "#E8A91E", green: "#1F9D55", red: "#C0392B",
  gray: "#6b6b6b", gray2: "#8a8a8a", line: "#E6E4DE", lineSoft: "#EFEDE7",
  fontDisplay: "'Syne', sans-serif", fontBody: "'DM Sans', sans-serif", fontPill: "'Montserrat', sans-serif",
};
export const STATUS = { Draft: T.gray2, Paid: T.blue, "In production": T.gold, Shipped: T.blue, Delivered: T.green, Booked: T.gold, Pending: T.gray2 };
