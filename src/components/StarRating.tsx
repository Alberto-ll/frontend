import { useState } from 'react';
import './StarRating.css';

interface StarRatingProps {
  rating?: number;
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function StarRating({ rating = 0, onRate, interactive = false, size = 'medium' }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const displayRating = hoverRating || rating;
  const sizeClass = `star-rating--${size}`;

  return (
    <div
      className={`star-rating ${sizeClass} ${interactive ? 'star-rating--interactive' : ''}`}
      onMouseLeave={() => interactive && setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayRating >= star;
        const halfFilled = !filled && displayRating >= star - 0.5;

        return (
          <span
            key={star}
            className={`star ${filled ? 'star--full' : halfFilled ? 'star--half' : 'star--empty'}`}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onClick={() => interactive && onRate?.(star)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            {filled || halfFilled ? '★' : '☆'}
          </span>
        );
      })}
    </div>
  );
}
