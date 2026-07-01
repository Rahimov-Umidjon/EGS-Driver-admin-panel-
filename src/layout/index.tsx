import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

const Layout = () => {
    return (
        <div className="h-screen flex "> 
                <Sidebar /> 

            <div className="w-full h-screen  flex flex-col overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
