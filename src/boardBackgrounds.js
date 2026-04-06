/** Keys stored in MongoDB `background` field — CSS gradients for board covers */
export const boardBackgrounds = {
  "gradient-blue": "linear-gradient(135deg, #0c66e4 0%, #09326c 50%, #5e4db2 100%)",
  "gradient-green": "linear-gradient(135deg, #4bce97 0%, #216e4e 100%)",
  "gradient-orange": "linear-gradient(135deg, #f87462 0%, #ae2e24 100%)",
  "gradient-purple": "linear-gradient(135deg, #9f8fef 0%, #5e4db2 100%)",
  "gradient-red": "linear-gradient(135deg, #f15b50 0%, #601e1b 100%)",
  "gradient-teal": "linear-gradient(135deg, #60c6d2 0%, #206b74 100%)",
  "gradient-sunset": "linear-gradient(135deg, #e774bb 0%, #f18f01 50%, #0c66e4 100%)",
  "gradient-slate": "linear-gradient(135deg, #626f86 0%, #2c3e5d 100%)",
};

export const backgroundOptions = Object.keys(boardBackgrounds);

export function backgroundStyle(key) {
  const bg = boardBackgrounds[key] || boardBackgrounds["gradient-blue"];
  return { backgroundImage: bg };
}
