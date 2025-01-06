import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventChart from "./EventChart";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventChart />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
