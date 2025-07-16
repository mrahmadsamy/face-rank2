import { Person } from "@shared/schema";
import { MessageCircle, Eye } from "lucide-react";
import StarRating from "./star-rating";

interface PersonCardProps {
  person: Person;
  onClick?: () => void;
}

const getRatingTitle = (rating: number) => {
  if (rating >= 4) return { title: "👑 إمبراطور", color: "text-[#00D9FF]" };
  if (rating >= 3) return { title: "😎 جامد نص نص", color: "text-[#00D9FF]" };
  if (rating >= 2) return { title: "😑 ملوش لازمة", color: "text-gray-400" };
  if (rating >= 1) return { title: "🤡 مهرج", color: "text-red-400" };
  return { title: "🐷 خنزير", color: "text-red-600" };
};

export default function PersonCard({ person, onClick }: PersonCardProps) {
  const ratingInfo = getRatingTitle(person.averageRating || 0);

  return (
    <div 
      className="neon-border rounded-xl overflow-hidden hover-glow transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={person.imageUrl} 
          alt={person.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=1a1a1a&color=00d9ff&size=400`;
          }}
        />
        <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 text-xs">
          <span className={ratingInfo.color}>{ratingInfo.title}</span>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center space-x-2 space-x-reverse">
          <StarRating rating={person.averageRating || 0} readonly size={16} />
          <span className="text-sm font-bold ml-2">{(person.averageRating || 0).toFixed(1)}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{person.name}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{person.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse text-sm">
            <span className="flex items-center">
              <MessageCircle className="text-[#00D9FF] mr-1" size={14} />
              {person.totalComments || 0}
            </span>
            <span className="flex items-center">
              <Eye className="text-[#FF0080] mr-1" size={14} />
              {(person.totalViews || 0) > 999 ? `${((person.totalViews || 0) / 1000).toFixed(1)}k` : person.totalViews || 0}
            </span>
          </div>
          <button className="text-[#39FF14] hover:text-[#39FF14]/80 transition-colors">
            ←
          </button>
        </div>
      </div>
    </div>
  );
}
