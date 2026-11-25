import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GamePage } from "@/pages/GamePage";
import { LandingPage } from "@/pages/LandingPage";
import { OnboardingPage } from "@/pages/OnboardingPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboard" element={<OnboardingPage />} />
        <Route path="/play" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
