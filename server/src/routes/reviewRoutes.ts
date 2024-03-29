import express from 'express';
import reviewController, {
  getMostLikedReviews,
} from '../controllers/reviewController';
import { jwtAuth } from '../middlewares/jwtAuthMiddleware';
import uploadFiles from '../utils/multer/uploadFiles';

const router = express.Router();

// multer middleware to process files
const upload = uploadFiles({
  path: `${__dirname}/../../assets/uploads/reviews/`,
  maxCount: 10,
  fieldName: 'image',
});

router.route('/').get(reviewController.getAllReviews).post(
  jwtAuth(), // authenticate users before creating reviews
  upload,
  reviewController.createReview
);

router.route('/most-liked').get(getMostLikedReviews);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

router.route('/:id/likes').patch(jwtAuth(), reviewController.handleReviewLikes);

export default router;
