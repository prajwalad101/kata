import ErrorMessage from '@destiny/common/data/errorsMessages';
import { NextFunction, Request, Response } from 'express';
import Business from '../models/businessModel';
import Question from '../models/questionModel';
import User from '../models/userModel';
import { APIFeatures } from '../utils/apiFeatures';
import AppError from '../utils/appError';
import { increaseBusinessHits } from '../utils/business/increaseBusinessHits';
import catchAsync from '../utils/catchAsync';

export const getAllQuestions = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const questionQuery = Question.find();

    questionQuery.populate('author');
    questionQuery.populate('replies.author');

    const features = new APIFeatures(questionQuery, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const questions = await features.query;

    res.status(200).json({
      status: 'success',
      documentCount: questions.length,
      data: questions,
    });
  }
);

export const getQuestion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: question,
    });
  }
);

export const createQuestion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const businessId = req.body.business;

    const business = await Business.findById(businessId);

    if (!business) {
      const error = new AppError('Business not found', 404);
      return next(error);
    }

    // prevent business owners from posting question on their own business
    if (business.owner.toString() === req.body.author) {
      const error = new AppError(
        'Business owners cannot post questions on their own business',
        400
      );
      return next(error);
    }
    let newQuestion = await Question.create(req.body);
    newQuestion = await newQuestion.populate('author');

    increaseBusinessHits({ businessId: req.body.business, hitScore: 3 });

    res.status(201).json({
      status: 'success',
      data: newQuestion,
    });
  }
);

export const createReply = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const businessId = req.body.businessId;
    if (!businessId) {
      const error = new AppError('Business id is required', 400);
      return next(error);
    }

    increaseBusinessHits({ businessId, hitScore: 2 });

    const query = Question.findByIdAndUpdate(
      req.body.questionId,
      {
        $push: {
          replies: { author: req.body.author, reply: req.body.reply },
        },
      },
      { new: true }
    );

    query.populate('author');
    query.populate('replies.author');
    const updatedQuestion = await query.select(['replies', 'business']);

    res.status(201).json(updatedQuestion);
  }
);

export const handleQuestionLikes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const questionId = req.params.id;
    const businessId = req.body.businessId;

    if (!businessId || !questionId) {
      const error = new AppError(
        'Business id and question id are required',
        400
      );
      return next(error);
    }

    // user who updates the post
    const user = await User.findById(req.body.userId);

    // check if the user is blocked
    if (user?.blocked) {
      const error = new AppError(ErrorMessage.suspended, 400);
      return next(error);
    }

    // increaseBusinessHits(businessId, 'likes');

    await Question.findByIdAndUpdate(
      questionId,
      {
        ...(req.body.type === 'increment' && {
          $inc: { 'likes.value': 1 },
          $addToSet: { 'likes.users': req.body.userId },
        }),
        ...(req.body.type === 'decrement' && {
          $inc: { 'likes.value': -1 },
          $pull: { 'likes.users': req.body.userId },
        }),
      },
      { new: true }
    );

    res.status(204).json({});
  }
);
