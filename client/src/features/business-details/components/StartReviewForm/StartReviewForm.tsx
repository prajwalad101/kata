import { useSubmitReview } from '@features/business-details/queries';
import { IReviewFormValues } from '@features/business-details/types';
import { Dialog, Transition } from '@headlessui/react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from 'src/layouts/UserProvider';
import { buildFormData } from 'src/utils/browser';
import { classNames } from 'src/utils/tailwind';
import Buttons from './Buttons';
import ReviewInput from './ReviewInput';
import SelectRating from './SelectRating';
import UploadImages from './UploadImages';

interface StartReviewProps {
  isOpen: boolean;
  closeModal: () => void;
}

export default function StartReview({ isOpen, closeModal }: StartReviewProps) {
  const { query } = useRouter();
  const businessId = query.businessId as string;
  const user = useAuth()?.user;

  const mutation = useSubmitReview();

  const { register, control, setValue, getValues, handleSubmit, reset } =
    useForm<IReviewFormValues>({
      defaultValues: { review: '', rating: 0 },
    });

  const resetForm = () => {
    reset({ review: '', rating: 0 });
  };

  const onSubmit: SubmitHandler<IReviewFormValues> = (data) => {
    const userId = user?._id;

    if (!userId) {
      return toast.error('You have to be logged in to submit a review.');
    }

    const formData = new FormData();
    buildFormData({ formData, data });
    formData.append('business', businessId);
    formData.append('author', userId);

    if (data.images) {
      data.images.forEach((image) => formData.append('image', image));
    }

    mutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Review successfully submitted.');
        resetForm();
        closeModal();
      },
      onError: (error) => {
        resetForm();
        if (error instanceof AxiosError) {
          const errorMsg = error.response?.data.message;
          return toast.error(errorMsg || 'Could not submit review');
        }
      },
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl">
                <div
                  className={classNames(
                    mutation.isLoading ? 'bg-gray-50' : 'bg-white',
                    'rounded-sm p-5 md:p-8'
                  )}
                >
                  <h3 className="mb-5 font-merriweather  text-[22px] font-bold md:mb-7">
                    Start your review
                  </h3>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <ReviewInput register={register} control={control} />
                    <SelectRating
                      register={register}
                      control={control}
                      setValue={setValue}
                      getValues={getValues}
                    />
                    <UploadImages register={register} setValue={setValue} />
                    <Buttons
                      isLoading={mutation.isLoading}
                      onCancel={closeModal}
                    />
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
