const getAverageReviewCount = (reviews: any) => {
  const averageRating =
    reviews.reduce((acc: number, review: any) => {
      return acc + review.rating;
    }, 0) / reviews.length;
  return {
    averageRating,
  };
};

export { getAverageReviewCount };
