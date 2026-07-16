import rating1 from '../assets/review-reactions/rating-1.webp';
import rating2 from '../assets/review-reactions/rating-2.webp';
import rating3 from '../assets/review-reactions/rating-3.webp';
import rating4 from '../assets/review-reactions/rating-4.webp';
import rating5 from '../assets/review-reactions/rating-5.webp';

const reviewReactions = {
  1: rating1,
  2: rating2,
  3: rating3,
  4: rating4,
  5: rating5,
} as const;

export function getReviewReaction(rating: number) {
  const roundedRating = Math.round(rating);
  const normalizedRating = Math.min(5, Math.max(1, roundedRating)) as keyof typeof reviewReactions;

  return reviewReactions[normalizedRating];
}
