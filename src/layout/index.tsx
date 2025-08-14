import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";

const Layout = () => {
    return (
        <div className="min-h-screen">
            <div className="fixed top-0 left-0 h-full  bg-white shadow-lg z-50">
                <Sidebar />
            </div>
            <div className="ml-16 flex flex-col">
                <div className="fixed top-0 left-16 right-0 h-16 bg-white shadow-md z-40">
                    <Navbar />
                </div>
                <main className="mt-16 p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
