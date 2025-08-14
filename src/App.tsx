import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/login";
import Order from "./pages/order";
import Layout from "./layout";
import Map from "./pages/map";
import Drivers from "./pages/drivers";
import Carries from "./pages/carriers";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};

const AuthRedirect = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Login /> : <Navigate to="/order" replace />;
};

const App = () => {
  const { loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route path="/login" element={<AuthRedirect />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/order" element={<Order />} />
          <Route path="/map" element={<Map />} />
          <Route path="/carriers" element={<Carries />} />
          <Route path="/drivers" element={<Drivers />} />
        </Route>
        <Route path="*" element={<Navigate to="/order" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
