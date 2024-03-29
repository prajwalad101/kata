import ErrorMessage from '@destiny/common/data/errorsMessages';
import { IUser } from '@destiny/common/types';
import { isString } from '@destiny/common/utils';
import useHandleQuestionLikes from '@features/business-details/queries/useHandleQuestionLikes';
import { IUserQuestion } from '@features/business-details/queries/useQuestions';
import useSubmitReply from '@features/business-details/queries/useSubmitReply';
import { AxiosError } from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
import { BiLike } from 'react-icons/bi';
import { BsReplyFill } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { PrimaryButton, SecondaryButton } from 'src/components';
import FormErrorMessage from 'src/components/FormErrorMessage/FormErrorMessage';
import { useAuth } from 'src/layouts/UserProvider';
import { getRelativeDate } from 'src/utils/date';
import { classNames } from 'src/utils/tailwind';
import ReportUserDropdown from '../ReportUserDropdown/ReportUserDropdown';

interface FormInputs {
  reply: string;
}

interface UserQuestionProps {
  data: IUserQuestion;
}

export default function UserQuestion({ data }: UserQuestionProps) {
  const user = useAuth()?.user;
  const businessId = useRouter().query.businessId;
  const [showReplyBox, setShowReplyBox] = useState(false);

  const { register, handleSubmit, formState, reset } = useForm<FormInputs>({
    defaultValues: {
      reply: '',
    },
  });

  const submitReply = useSubmitReply();
  const handleQuestionLikeMutation = useHandleQuestionLikes();

  const handleReply = () => {
    if (!user) {
      return toast.error('You have to be logged in to add a reply');
    }
    setShowReplyBox(true);
  };

  // check if user has already liked the post
  const alreadyLiked = user?._id && data.likes.users.includes(user?._id);

  const handleQuestionLike = () => {
    const userId = user?._id;

    if (!userId) return toast.error(ErrorMessage.loggedOut);

    if (user.suspended) {
      return toast.error(ErrorMessage.suspended);
    }
    if (user.banned) {
      return toast.error(ErrorMessage.banned);
    }

    if (isString(businessId)) {
      handleQuestionLikeMutation.mutate(
        {
          userId,
          questionId: data._id.toString(),
          businessId,
          type: alreadyLiked ? 'decrement' : 'increment',
        },
        {
          onError: (err) => {
            if (err instanceof AxiosError) {
              toast.error(err.response?.data.message);
            }
          },
        }
      );
    }
  };

  const handleReplyCancel = () => {
    reset({ reply: '' });
    setShowReplyBox(false);
  };

  useEffect(() => {
    if (submitReply.isSuccess || submitReply.isError) {
      reset({ reply: '' });
    }
  }, [submitReply.isSuccess, submitReply.isError, reset]);

  const onSubmit = (formData: FormInputs) => {
    if (!user?._id) return;
    if (!isString(businessId)) return toast.error('Invalid business id');

    if (user.suspended) return toast.error(ErrorMessage.suspended);
    if (user.banned) return toast.error(ErrorMessage.banned);

    submitReply.mutate(
      {
        questionId: data._id.toString(),
        author: user?._id,
        reply: formData.reply,
        businessId,
      },
      {
        onSuccess: () => {
          toast.success('Successfully submitted reply');
          setShowReplyBox(false);
        },
        onError: () => {
          toast.error('Something went wrong');
        },
      }
    );
  };

  return (
    <div
      className={classNames(
        data.replies.length > 0 ? 'pt-5' : 'py-5',
        'border-b-2 border-gray-200'
      )}
    >
      <div>
        <div className="mb-4 flex justify-between">
          <div className="flex gap-5">
            <div className="h-[50px] w-[50px] shrink-0 ">
              <Image
                className="rounded-full"
                src={data.author.picture}
                alt="user-profile"
                width={50}
                height={50}
                objectFit="cover"
              />
            </div>
            <div>
              <p className="font-medium capitalize">{data.author.userName}</p>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {data.author.numReviews} reviews
                </p>
                <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-gray-600" />
                <p className="text-gray-600">
                  {getRelativeDate(data.createdAt)}
                </p>
              </div>
            </div>
          </div>
          <ReportUserDropdown userId={data.author._id} />
        </div>
        <div>
          <p className="mb-3">{data.question}</p>
          <div
            className={classNames(
              data.replies.length > 0 ? 'mb-5' : '',
              'flex items-center gap-4'
            )}
          >
            <div
              onClick={handleQuestionLike}
              className={classNames(
                alreadyLiked ? 'text-blue-600' : '',
                'flex cursor-pointer items-center gap-2 text-gray-700 hover:text-blue-600'
              )}
            >
              {alreadyLiked ? (
                <AiFillLike size={20} />
              ) : (
                <AiOutlineLike size={20} />
              )}
              <button>Like</button>
            </div>
            <Seperator />
            <div
              onClick={handleReply}
              className="flex cursor-pointer items-center gap-3 
              text-primaryred hover:text-red-700"
            >
              <BsReplyFill size={20} />
              <button>Reply</button>
            </div>
            <Seperator />
            <p className="text-gray-600">{data.likes.value} likes</p>
          </div>
          {showReplyBox && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3 px-1">
                <textarea
                  {...register('reply', {
                    required: 'Reply cannot be empty',
                    maxLength: {
                      value: 200,
                      message: 'Your reply is too long',
                    },
                    minLength: {
                      value: 6,
                      message: 'Your reply is too short',
                    },
                  })}
                  className={classNames(
                    data.replies.length <= 0 ? 'mt-4' : '',
                    'mb-3 w-full rounded-md border-2 border-gray-300 p-4 outline-none ring-blue-600 focus:ring'
                  )}
                  rows={4}
                  placeholder="Add your reply here ..."
                />
                <FormErrorMessage
                  className="mb-2"
                  error={formState.errors.reply}
                />
                <div className="mb-4 flex gap-5">
                  <PrimaryButton
                    isLoading={submitReply.isLoading}
                    className="px-10 py-2"
                  >
                    Post
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={handleReplyCancel}
                    className="px-7 py-2"
                  >
                    Cancel
                  </SecondaryButton>
                </div>
              </div>
            </form>
          )}
          {data.replies.length > 0 &&
            data.replies.map(({ reply, likes, author }, index) => (
              <UserReply
                key={index}
                reply={reply}
                author={author}
                likes={likes.value}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

interface UserReplyProps {
  reply: string;
  likes: number;
  author: IUser;
}

function UserReply({ reply, likes, author }: UserReplyProps) {
  return (
    <div className="flex border-l-[3px] border-b-0 border-gray-200 py-2">
      <div className="grow border-gray-200 pl-5">
        <div className="mb-4 flex justify-between">
          <div className="flex items-center gap-5">
            <div className="h-[40px] w-[40px] shrink-0 ">
              <Image
                className="rounded-full"
                src={author.picture}
                alt="user-profile"
                width={40}
                height={40}
                objectFit="cover"
              />
            </div>
            <div>
              <p className="font-medium capitalize text-gray-900">
                {author.userName}
              </p>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">{author.numReviews} reviews</p>
                {/* <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-gray-600" />
                <p className="text-gray-600">{author.trustPoints} tp</p> */}
              </div>
            </div>
          </div>
          <ReportUserDropdown userId={author._id} />
        </div>
        <p className="mb-3">{reply}</p>
        <div className="mb-2 flex items-center gap-4">
          <div className="flex cursor-pointer items-center gap-2 text-gray-700 hover:text-blue-800">
            <BiLike size={20} />
            <button>Like</button>
          </div>
          <Seperator />
          {/* <button className="text-blue-600 hover:text-blue-800">Reply</button>
          <Seperator /> */}
          <p className="text-gray-600">{likes} likes</p>
        </div>
      </div>
    </div>
  );
}

function Seperator() {
  return <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-gray-600" />;
}
