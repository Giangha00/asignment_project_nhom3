import React from "react";
import { Link } from "react-router-dom";
import { Grid3x3, Mail, Sparkles } from "lucide-react";

function BottomNav() {
  return (
    <nav className="pointer-events-none fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 justify-center px-2 w-full max-w-fit">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#3c444d] bg-[#1d2125]/95 px-2 py-1.5 shadow-xl backdrop-blur-md">
        <button type="button" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#9fadbc] hover:bg-[#3d454c] hover:text-white transition-colors">
          <Mail className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Hộp thư đến</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#9fadbc] hover:bg-[#3d454c] hover:text-white transition-colors">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Bảng thông tin</span>
        </button>
        <div className="h-4 w-[1px] bg-[#3c444d] mx-1" />
        <Link to="/home" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#9fadbc] hover:bg-[#3d454c] hover:text-white transition-colors">
          <Grid3x3 className="h-3.5 w-3.5" />
          <span>Các bảng</span>
        </Link>
      </div>
    </nav>
  );
}

export default BottomNav;
