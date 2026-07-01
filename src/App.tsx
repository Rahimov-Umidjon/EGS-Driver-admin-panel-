import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "./context/AuthContext";
import Drivers from "./pages/driver";
import Files from "./pages/files"; 
import Chats from "./pages/chats";
import api from "./api/api.ts"; 

const Login = lazy(() => import("./pages/login"));
const Passport = lazy(() => import("./pages/passports/pasport.tsx"));
const Passports = lazy(() => import("./pages/passports/index.tsx"));
const Layout = lazy(() => import("./layout"));
const NewMap = lazy(() => import("./pages/newMap"));
const ChatsId = lazy(() => import("./pages/chatId"));
const VerificationQueue = lazy(() => import("./pages/queues"));  
const BakatQazAvtoJol = lazy(() => import("./pages/bakatQazAvtoJol"));  
const KazEPIFailed = lazy(() => import("./pages/kazepi/kazEPIFailed.tsx"));  
const UzEPI = lazy(() => import("./pages/uzEPI/index.tsx"));  
const Prices = lazy(() => import("./pages/prices"));
const RusQueue = lazy(() => import("./pages/rusQueue"));
const RusKazInsurance = lazy(() => import("./pages/rusInsurance")); 
const Guarantees = lazy(() => import("./pages/guarantee")); 
const Admins = lazy(() => import("./pages/admins")); 
const Roles = lazy(() => import("./pages/roles")); 
const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};
const AuthRedirect = () => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? <Login /> : <Navigate to="/new-map" replace />;
};

const App = () => {
    const { loading } = useAuth();
    const { setUser } = useAuth();

    useEffect(() => {
        fetchUser();
    }, [])

    const fetchUser = async () => {
        try {
            const res = await api.get("/admin/profile");
            console.log(res);
            setUser(res.data);
        } catch (err) {
            console.log(err);
        }
    }


    if (loading) return <div>Loading...</div>;


    return (
        <Router>
            <ToastContainer position="top-right" autoClose={2000} />
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/login" element={<AuthRedirect />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/new-map" element={<NewMap />} />
                        <Route path="/chats/:id" element={
                            <Chats>
                                <ChatsId />
                            </Chats>} />
                        <Route path="/chats" element={
                            <Chats>
                                <ChatsId />
                            </Chats>} /> 
                        <Route path="/files" element={<Files />} />
                        <Route path="/drivers" element={<Drivers />} />
                        <Route path="/admins" element={<Admins />} />
                        <Route path="/roles" element={<Roles />} />
                        <Route path="/passports" element={<Passports />} />
                        <Route path="/passport" element={<Passport />} />
                        <Route path="/kazepi/:status" element={<KazEPIFailed />} />
                        <Route path="/uzepi/:status" element={<UzEPI />} />
                        <Route path="/prices" element={<Prices />} />
                        <Route path="/queue/:status" element={<VerificationQueue />} /> 
                        <Route path="/bakat-qaz-avto-jol/:status" element={<BakatQazAvtoJol />} /> 
                        <Route path="/rus-queue/:status" element={<RusQueue />} /> 
                        <Route path="/rus-kaz-insurance/:status" element={<RusKazInsurance />} />  
                        <Route path="/guarantees/:status" element={<Guarantees />} />  
                    </Route>
                    <Route path="*" element={<Navigate to="/new-map" replace />} />
                </Routes>
            </Suspense>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </Router>
    );
};

export default App;
