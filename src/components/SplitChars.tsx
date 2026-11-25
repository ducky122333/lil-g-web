import type { ElementType } from "react";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Words to render in the iridescent gradient accent. */
  accent?: string[];
};

/**
 * Splits text into `.char` spans for GSAP while keeping words unbreakable and
 * exposing the original sentence to assistive tech.
 */
export function SplitChars({ text, as: Tag = "span", className, accent = [] }: Props) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, wi) => {
        const isAccent = accent.includes(word.replace(/[^\w']/g, ""));
        const before = words.slice(0, wi).join(" ").length;
        return (
          <span key={wi} aria-hidden className="split-word">
            {Array.from(word).map((ch, ci) => (
              <span
                key={ci}
                className={`char${isAccent ? " accent" : ""}`}
                style={isAccent ? ({ "--i": before + ci } as React.CSSProperties) : undefined}
              >
                {ch}
              </span>
            ))}
            {wi < words.length - 1 && <span className="char">&nbsp;</span>}
          </span>
        );
      })}
    </Tag>
  );
}
