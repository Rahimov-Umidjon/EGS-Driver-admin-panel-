import { useAuth } from "../../context/AuthContext";

const Profile = () => {
    const { user } = useAuth();

    if (!user?.admin) return null;

    const admin = user.admin;

    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {admin.name?.charAt(0).toUpperCase()}
            </div>

            <div className="hidden md:flex flex-col items-start">
                <h4 className="text-sm font-medium leading-none">
                    {admin.name}
                </h4>

                <p className="text-xs text-gray-500 truncate max-w-[180px]">
                    {admin.email}
                </p>

                <p className="text-xs text-blue-600 font-medium">
                    {admin.roles?.[0]?.name || "Admin"}
                </p>
            </div>
        </div>
    );
};

export default Profile;