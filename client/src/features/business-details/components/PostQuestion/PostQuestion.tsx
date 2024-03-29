import { isString } from '@destiny/common/utils';
import useSubmitQuestion from '@features/business-details/queries/useSubmitQuestion';
import { AxiosError } from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BsDot } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { PrimaryButton, SecondaryButton } from 'src/components';
import FormErrorMessage from 'src/components/FormErrorMessage/FormErrorMessage';
import { useAuth } from 'src/layouts/UserProvider';

interface FormInputs {
  question: string;
}

const defaultValues: FormInputs = {
  question: '',
};

interface PostQuestionProps {
  closeDialog: () => void;
}

export default function PostQuestion({ closeDialog }: PostQuestionProps) {
  const business = useRouter().query.businessId;
  const user = useAuth()?.user;

  const { register, watch, handleSubmit, formState, reset } = useForm({
    defaultValues,
  });
  const submitQuestionMutation = useSubmitQuestion();

  const onSubmit = (data: FormInputs) => {
    // check if author and business exists
    if (user?._id && isString(business)) {
      submitQuestionMutation.mutate(
        {
          question: data.question,
          business,
          author: user?._id,
        },
        {
          onError: (error) => {
            if (error instanceof AxiosError) {
              toast.error(error.response?.data.message);
            }
          },
        }
      );
    } else {
      toast.error('Something went wrong.');
    }
  };

  useEffect(() => {
    if (submitQuestionMutation.isSuccess) {
      reset(defaultValues);
      toast.success('Successfully posted question');
      closeDialog();
    }
  }, [submitQuestionMutation.isSuccess]);

  const question = watch('question');

  return (
    <form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
      {user && (
        <div className="mb-5 flex items-center gap-5">
          <Image
            src={user?.picture || ''}
            width={50}
            height={50}
            alt="user profile"
            className="rounded-full"
          />
          <div>
            <p>{user?.userName}</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-600">{user.numReviews} reviews</p>
              <p>
                <BsDot />
              </p>
              <p className="text-gray-600">{user.trustPoints} tp</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <textarea
          id="question"
          {...register('question', {
            required: 'Please enter your question',
            maxLength: {
              value: 300,
              message: 'Question is too long',
            },
            minLength: {
              value: 5,
              message: 'Question is too short',
            },
          })}
          rows={7}
          className="mb-3 w-full rounded-md bg-gray-200 py-4 px-5 ring-inset ring-blue-500 focus:outline-none focus:ring"
          placeholder="Write your question"
        />
        <div className="flex items-center justify-between">
          <FormErrorMessage error={formState.errors.question} />
          <p className="grow text-right text-sm text-gray-600">
            {question.length} / 200
          </p>
        </div>
      </div>
      <div className="mb-8 flex flex-wrap gap-8">
        <SecondaryButton className="px-8 py-2" onClick={closeDialog}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          isLoading={submitQuestionMutation.isLoading}
          className="px-10 py-2"
          type="submit"
        >
          Post
        </PrimaryButton>
      </div>
      <div className="border-b border-gray-300" />
    </form>
  );
}
