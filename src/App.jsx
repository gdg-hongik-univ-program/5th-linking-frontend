import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import Layout from "./components/layout/Layout";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <div className="min-h-screen bg-zinc-900 flex justify-center items-center">
      <div className="w-full max-w-[390px] min-h-screen bg-brand-bg shadow-xl overflow-hidden relative border-x border-zinc-700">
      <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path = "/signup" element = {<SignupPage />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<HomePage />} />
        </Route>
      </Routes>
      </div>
    </div>
  );
}

export default App;
