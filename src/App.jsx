import React from "react";
import MapComponent from "./Map";
import AuthProvider from "./firebase/AuthContext";

const App = () => {
  return(
    <>
      {/* <AuthProvider> */}
        <MapComponent />
      {/* </AuthProvider> */}
    </>
  )
}

export default App;