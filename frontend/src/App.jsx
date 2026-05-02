import Home from "./pages/Home";
import HospitalDashboard from "./pages/HospitalDashboard";
import Login from "./pages/Login";

function App() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Login />;
  }

  return (
    <>
      <Home />
      <HospitalDashboard />
    </>
  );
}

export default App;
