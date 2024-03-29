import { IUser } from '@destiny/common/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import useCreateApi from 'src/api/useCreateApi';
import { QuestionsResponseData } from './useQuestions';

interface Response {
  _id: string;
  author: IUser;
  business: string;
  replies: {
    _id: string;
    reply: string;
    likes: { value: number; users: string[] };
    author: IUser;
  }[];
}

const submitReply = async (data: MutationProps, api: AxiosInstance) => {
  const response = await api.post<Response>('/questions/reply', data);
  return response.data;
};

interface MutationProps {
  questionId: string;
  author: string;
  reply: string;
  businessId: string;
}

export default function useSubmitReply() {
  const api = useCreateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: MutationProps) => submitReply(data, api),
    onSuccess: (newData, variables) => {
      queryClient.setQueriesData<QuestionsResponseData>(
        ['questions', { business: newData.business }],
        (oldData) => {
          if (!oldData) return undefined;

          // find which question the reply belongs to
          const newQuestion = oldData.data.find(
            (data) => data._id.toString() === variables.questionId
          );
          if (!newQuestion) return undefined;

          const oldQuestions = oldData.data.filter(
            (data) => data._id.toString() !== variables.questionId
          );

          // add new reply to the replies list
          newQuestion.replies = newData.replies;

          // merge newQuestion with old data
          const updatedData = {
            ...oldData,
            data: [newQuestion, ...oldQuestions],
          };

          return updatedData;
        }
      );
    },
  });

  return mutation;
}
