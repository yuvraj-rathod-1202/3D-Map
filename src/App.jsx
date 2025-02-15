import React from "react";
import MapComponent from "./Map";
import AuthProvider from "./firebase/AuthContext";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import AddEvents from "./pages/AddEvents";

const App = () => {
  return(
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MapComponent />} />
            <Route path="/login" element={<AddEvents />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App;