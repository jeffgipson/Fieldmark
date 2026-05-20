import { appPath } from "../../lib/links";
import Button from "../ui/Button";

export default function BlogPostBody({ blocks }) {
  return (
    <div className="blog-prose mx-auto max-w-3xl">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={index} className="blog-h2">
                {block.text}
              </h2>
            );
          case "p":
            return (
              <p key={index} className="blog-p">
                {block.text}
              </p>
            );
          case "ul":
            return (
              <ul key={index} className="blog-ul">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
          case "blockquote":
            return (
              <blockquote key={index} className="blog-blockquote">
                {block.text}
              </blockquote>
            );
          case "cta":
            return (
              <div key={index} className="blog-cta">
                <p className="text-base font-bold text-fm-gray-dark">{block.text}</p>
                <Button
                  href={block.href === "register" ? appPath("/register") : block.href}
                  className="mt-4 !text-sm"
                >
                  Start free trial
                </Button>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
