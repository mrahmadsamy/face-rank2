import { Link, useLocation } from "wouter";
import { Eye, Plus, Flame, Trophy } from "lucide-react";
import { useState } from "react";
import AddPersonModal from "./add-person-modal";

export default function Navigation() {
  const [location] = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-lg border-b border-[#00D9FF]/30 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/">
                <h1 className="font-black text-2xl text-[#FF0080] animate-pulse-neon cursor-pointer">
                  <Eye className="inline mr-2" size={28} />
                  FaceRank
                </h1>
              </Link>
              <span className="text-sm text-gray-400">المنصة اللي كل وش فيها له تمن</span>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#00D9FF]/20 text-[#00D9FF] rounded-lg hover-glow border border-[#00D9FF]/50 transition-all duration-300"
              >
                <Plus className="inline mr-2" size={16} />
                إضافة شخص
              </button>
              <Link href="/facemash">
                <button className={`px-4 py-2 bg-[#FF0080]/20 text-[#FF0080] rounded-lg hover-glow border border-[#FF0080]/50 transition-all duration-300 ${location === '/facemash' ? 'bg-[#FF0080]/40' : ''}`}>
                  <Flame className="inline mr-2" size={16} />
                  FaceMash
                </button>
              </Link>
              <Link href="/rankings">
                <button className={`px-4 py-2 bg-[#39FF14]/20 text-[#39FF14] rounded-lg hover-glow border border-[#39FF14]/50 transition-all duration-300 ${location === '/rankings' ? 'bg-[#39FF14]/40' : ''}`}>
                  <Trophy className="inline mr-2" size={16} />
                  التصنيفات
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <AddPersonModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </>
  );
}
