import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({ rating, onRate, readonly = false, size = 20 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (newRating: number) => {
    if (!readonly && onRate) {
      onRate(newRating);
    }
  };

  const handleMouseEnter = (newRating: number) => {
    if (!readonly) {
      setHoverRating(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const getStarColor = (starNumber: number) => {
    const currentRating = hoverRating || rating;
    return starNumber <= currentRating ? '#fbbf24' : '#6b7280';
  };

  return (
    <div className="flex space-x-1 space-x-reverse">
      {[1, 2, 3, 4, 5].map((starNumber) => (
        <button
          key={starNumber}
          onClick={() => handleClick(starNumber)}
          onMouseEnter={() => handleMouseEnter(starNumber)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={`transition-colors duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            size={size}
            fill={getStarColor(starNumber)}
            color={getStarColor(starNumber)}
          />
        </button>
      ))}
    </div>
  );
}
