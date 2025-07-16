import { Link, useLocation } from "wouter";
import { Eye, Plus, Flame, Trophy } from "lucide-react";
import { useState } from "react";
import AddPersonModal from "./add-person-modal";

export default function Navigation() {
  const [location] = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full cyber-card border-b border-purple-500/50 z-50 cyber-scan">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-6 space-x-reverse">
              <Link href="/">
                <h1 className="font-black text-xl md:text-3xl gradient-cyber cursor-pointer hover-cyber tracking-wider">
                  <Eye className="inline mr-2 md:mr-3 text-purple-400" size={24} />
                  <span className="hidden sm:inline">FACERANK</span>
                  <span className="sm:hidden">FR</span>
                </h1>
              </Link>
              <div className="hidden lg:block">
                <span className="text-xs md:text-sm text-purple-400/80 font-mono tracking-wide">
                  {">> نظام تقييم الوجوه المتطور"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse">
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-3 md:px-5 py-2 md:py-2.5 cyber-border hover-cyber text-cyan-400 font-mono text-xs md:text-sm tracking-wide uppercase font-bold transition-all duration-200"
              >
                <Plus className="inline mr-1 md:mr-2" size={16} />
                <span className="hidden sm:inline">[+] إضافة</span>
                <span className="sm:hidden">[+]</span>
              </button>
              <Link href="/facemash">
                <button className={`px-3 md:px-5 py-2 md:py-2.5 cyber-border hover-cyber text-orange-400 font-mono text-xs md:text-sm tracking-wide uppercase font-bold transition-all duration-200 ${location === '/facemash' ? 'cyber-glow-intense' : ''}`}>
                  <Flame className="inline mr-1 md:mr-2" size={16} />
                  <span className="hidden sm:inline">[◉] مواجهة</span>
                  <span className="sm:hidden">[◉]</span>
                </button>
              </Link>
              <Link href="/rankings">
                <button className={`px-3 md:px-5 py-2 md:py-2.5 cyber-border hover-cyber text-green-400 font-mono text-xs md:text-sm tracking-wide uppercase font-bold transition-all duration-200 ${location === '/rankings' ? 'cyber-glow-intense' : ''}`}>
                  <Trophy className="inline mr-1 md:mr-2" size={16} />
                  <span className="hidden sm:inline">[#] ترتيب</span>
                  <span className="sm:hidden">[#]</span>
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
