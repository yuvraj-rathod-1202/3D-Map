import React from "react";
import MapComponent from "./Map";
import AuthProvider from "./firebase/AuthContext";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import AddEvents from "./pages/AddEvents";
import Login from "./pages/Login";

const App = () => {
  return(
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MapComponent />} />
            <Route path="/addevents" element={<AddEvents />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App;