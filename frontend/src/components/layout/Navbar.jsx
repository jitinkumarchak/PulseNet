import { FaBell } from "react-icons/fa";

function Navbar() {
  return (
    <div className="flex items-center justify-between mb-8">

      {/* Left */}
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-slate-400 mt-1">
          Monitor emergency requests in real-time
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        {/* Notification */}
        <div className="relative cursor-pointer">

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <FaBell className="text-xl" />
          </div>

          {/* Notification Dot */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>

        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">

          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center font-bold">
            H
          </div>

          <div>
            <p className="font-medium">
              City Hospital
            </p>

            <p className="text-sm text-slate-400">
              Hospital Admin
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Navbar;