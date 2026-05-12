import { FaHospital, FaHome, FaBell } from "react-icons/fa";

function MainLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-slate-950 text-white">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6">

                <h1 className="text-3xl font-bold text-red-500 mb-10">
                    PulseNet
                </h1>

                <nav className="space-y-4">

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/20 text-red-400 cursor-pointer">
                        <FaHome />
                        <span>Dashboard</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/20 text-red-400 cursor-pointer">
                        <FaHospital />
                        <span>Hospitals</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/20 text-red-400 cursor-pointer">
                        <FaBell />
                        <span>Notifications</span>
                    </div>

                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>

        </div>
    );
}

export default MainLayout;