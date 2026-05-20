import { BrowserRouter, Route, Routes } from "react-router-dom";
import LocalDevBar from "./components/dev/LocalDevBar";
import HomePage from "./pages/HomePage";
import DeveloperPage from "./pages/DeveloperPage";
import DeveloperMcpPage from "./pages/DeveloperMcpPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";

export default function App() {
  return (
    <BrowserRouter>
      <LocalDevBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/developer/MCP" element={<DeveloperMcpPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </BrowserRouter>
  );
}
