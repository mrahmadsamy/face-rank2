import { Person } from "@shared/schema";
import { MessageCircle, Eye } from "lucide-react";
import StarRating from "./star-rating";

interface PersonCardProps {
  person: Person;
  onClick?: () => void;
}

const getRatingTitle = (rating: number) => {
  if (rating >= 4) return { title: "[★] إمبراطور", color: "text-cyan-400" };
  if (rating >= 3) return { title: "[◉] جامد نص نص", color: "text-purple-400" };
  if (rating >= 2) return { title: "[◇] ملوش لازمة", color: "text-gray-400" };
  if (rating >= 1) return { title: "[▲] مهرج", color: "text-orange-400" };
  return { title: "[✕] خنزير", color: "text-red-400" };
};

export default function PersonCard({ person, onClick }: PersonCardProps) {
  const ratingInfo = getRatingTitle(person.averageRating || 0);

  return (
    <div 
      className="cyber-border rounded-lg overflow-hidden hover-cyber transition-all duration-200 group cursor-pointer cyber-scan"
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
        <div className="absolute top-2 right-2 cyber-card px-3 py-1 text-xs font-mono">
          <span className={`${ratingInfo.color} font-bold tracking-wider`}>{ratingInfo.title}</span>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center space-x-2 space-x-reverse">
          <StarRating rating={person.averageRating || 0} readonly size={16} />
          <span className="text-sm font-bold ml-2">{(person.averageRating || 0).toFixed(1)}</span>
        </div>
      </div>
      
      <div className="p-4 bg-gray-900/50">
        <h3 className="font-bold text-lg mb-1 text-white font-mono tracking-wide">{person.name}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2 font-mono">{person.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse text-sm font-mono">
            <span className="flex items-center text-cyan-400">
              <MessageCircle className="mr-1" size={14} />
              {person.totalComments || 0}
            </span>
            <span className="flex items-center text-magenta-400">
              <Eye className="mr-1" size={14} />
              {(person.totalViews || 0) > 999 ? `${((person.totalViews || 0) / 1000).toFixed(1)}k` : person.totalViews || 0}
            </span>
          </div>
          <button className="text-green-400 hover:text-green-300 transition-colors font-mono font-bold">
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
}
