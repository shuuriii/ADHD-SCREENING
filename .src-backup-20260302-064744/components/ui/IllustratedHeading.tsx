import React from "react";

const COLORS = [
  "#46a83c",
  "#2c6e25",
  "#65c058",
  "#d97706",
  "#2c6e25",
  "#46a83c",
  "#65c058",
  "#d97706",
];
const ROTATES = [
  "-2deg",
  "1.5deg",
  "-1deg",
  "2.5deg",
  "-1.5deg",
  "1deg",
  "-2deg",
  "2deg",
];

export default function IllustratedHeading({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={`leading-tight ${className}`}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          {i > 0 && " "}
          <span
            className="font-display font-bold inline-block"
            style={{
              color: COLORS[i % COLORS.length],
              transform: `rotate(${ROTATES[i % ROTATES.length]})`,
              transformOrigin: "bottom center",
            }}
          >
            {word}
          </span>
        </React.Fragment>
      ))}
    </span>
  );
}
