// components/renderColoredText.js
import colorMap from "./colorMap";
export default function renderColoredText(text) {
  const regex = /(§[0-9a-z])/g;
  const parts = text.split(regex).filter(Boolean);
  let currentColor = '#FFFFFF';
  return parts.map((part, index) => {
    if (colorMap[part]) {
      currentColor = colorMap[part];
      return null;
    }
    return (
      <span key={index} style={{ color: currentColor }}>
        {part}
      </span>
    );
  });
}
