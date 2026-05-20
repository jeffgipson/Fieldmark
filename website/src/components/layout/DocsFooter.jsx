import { Link } from "react-router-dom";
import { BRAND } from "../../constants/brand";

export default function DocsFooter() {
  return (
    <footer className="border-t border-fm-gray-medium/20 bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-fm-charcoal/70 sm:flex-row lg:px-8">
        <p>
          &copy; {new Date().getFullYear()} {BRAND.name} · API v1
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-6 font-bold">
          <Link to="/developer" className="text-fm-teal-dark hover:underline">
            Developer docs
          </Link>
          <a
            href="https://github.com/jeffgipson/Fieldmark/blob/main/docs/JUDGE_REVIEW.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fm-teal-dark"
          >
            Judge review
          </a>
          <a href="/llm.txt" target="_blank" rel="noopener noreferrer" className="hover:text-fm-teal-dark">
            llm.txt
          </a>
          <a
            href="https://github.com/jeffgipson/Fieldmark/blob/main/docs/BUSINESS_MODEL.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fm-teal-dark"
          >
            Business model
          </a>
          <a
            href="https://github.com/jeffgipson/Fieldmark/blob/main/docs/MARKETING_PLAN.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fm-teal-dark"
          >
            Marketing plan
          </a>
          <Link to="/developer/MCP" className="hover:text-fm-teal-dark">
            MCP setup
          </Link>
          <a
            href="https://github.com/jeffgipson/Fieldmark/blob/main/api/docs/API.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fm-teal-dark"
          >
            Full API spec
          </a>
        </nav>
      </div>
    </footer>
  );
}
