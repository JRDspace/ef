import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OrgChart from "./OrgChart";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrgChart />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
