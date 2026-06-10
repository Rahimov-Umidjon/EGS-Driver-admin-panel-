import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

const Layout = () => {
    return (
        <div className="h-screen   flex ">
            {/*<div className="fixed top-0 left-0 h-full  bg-white shadow-lg z-50">*/}
                <Sidebar />
            {/*</div>*/}

            <div className="w-full h-screen  flex flex-col overflow-y-auto">
                {/*<div className="fixed top-0 left-16 right-0 h-16 bg-white shadow-md z-40">*/}
                {/*    <Navbar />*/}
                {/*</div>*/}
                {/*<main className="mt-16 p-4">*/}

                {/*</main>*/}
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
