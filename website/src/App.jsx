import { BrowserRouter, Route, Routes } from "react-router-dom";
import LocalDevBar from "./components/dev/LocalDevBar";
import HomePage from "./pages/HomePage";
import DeveloperPage from "./pages/DeveloperPage";

export default function App() {
  return (
    <BrowserRouter>
      <LocalDevBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/developer" element={<DeveloperPage />} />
      </Routes>
    </BrowserRouter>
  );
}
