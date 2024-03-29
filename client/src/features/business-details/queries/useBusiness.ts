import { IBusiness } from '@destiny/common/types';
import { isString } from '@destiny/common/utils';
import { useQuery } from '@tanstack/react-query';
import axios, { AxiosInstance } from 'axios';
import { useRouter } from 'next/router';
import useCreateApi from 'src/api/useCreateApi';

export interface Response {
  status: string;
  data: IBusiness;
}

export const fetchBusiness = async (
  businessId: string,
  api?: AxiosInstance // optional in case of server side fetching
) => {
  let result;

  if (api) {
    result = await api.get<Response>(`/business/${businessId}`);
  } else {
    result = await axios.get<Response>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/business/${businessId}`
    );
  }

  return result.data.data;
};

export default function useBusiness() {
  const {
    query: { businessId },
  } = useRouter();

  const api = useCreateApi();
  const id = isString(businessId) ? businessId : '';

  const query = useQuery(
    ['business', businessId],
    () => fetchBusiness(id, api),
    { staleTime: 1000 * 10 * 10 } // 10 mins
  );

  return query;
}
