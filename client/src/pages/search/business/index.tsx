import { isString } from '@destiny/common/utils';
import {
  BusinessListSkeleton,
  SearchFilter,
  SortItems,
} from '@features/search-business/components';
import BusinessNotFound from '@features/search-business/components/BusinessNotFound/BusinessNotFound';
import MapSearch from '@features/search-business/components/MapSearch/MapSearch';
import { sortOptions } from '@features/search-business/components/SortItems/SortItems';
import { useFetchBusinesses } from '@features/search-business/hooks';
import { fetchBusinesses } from '@features/search-business/hooks/useFetchBusinesses';
import {
  BusinessList,
  SearchBusinessSection,
} from '@features/search-business/layouts';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { PropagateLoader } from 'react-spinners';
import { NavigationProvider } from 'src/components/context-provider';
import { AppLayout } from 'src/components/layout';
import { Navbar, Sidebar } from 'src/components/navigation';
import { NextPageWithLayout } from 'src/pages/_app';

const SearchBusiness: NextPageWithLayout = () => {
  const { name, city, category } = useRouter().query;

  const [selectedSort, setSelectedSort] = useState<string>(
    sortOptions[0].value
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<[number, number]>();

  const { ref, inView } = useInView();

  const { data, isLoading, isSuccess, fetchNextPage, isFetchingNextPage } =
    useFetchBusinesses({
      sort: selectedSort,
      features: selectedFeatures,
      coordinates,
    });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const filterComponent = (
    <SearchFilter
      selectedFeatures={selectedFeatures}
      setSelectedFeatures={setSelectedFeatures}
    />
  );

  const SortComponent = (
    <SortItems
      sort={selectedSort}
      onSelect={(selected) => setSelectedSort(selected)}
    />
  );

  const Map = <MapSearch coordinates={coordinates} onChange={setCoordinates} />;

  return (
    <>
      <Head>
        <title>{`Search ${name || category} in ${city}`}</title>
        <meta
          property="og:title"
          content={`Search ${name || category} in ${city}`}
          key="Search Page"
        />
      </Head>
      <SearchBusinessSection
        filterComponent={filterComponent}
        sortComponent={SortComponent}
        mapComponent={Map}
      >
        <>
          {isLoading && <BusinessListSkeleton />}
          {isSuccess && data.pages[0].documentCount === 0 ? (
            <BusinessNotFound />
          ) : (
            data?.pages.map(({ page, data }) => (
              <MemoBusinessList key={page} businessData={data} />
            ))
          )}
          {data?.pages.length === 0 && <div>NOT FOUND</div>}
          <div className="mb-10 flex justify-center">
            <div ref={ref}>
              {isFetchingNextPage && (
                <PropagateLoader speedMultiplier={0.8} color="#F55A5A" />
              )}
            </div>
          </div>
        </>
      </SearchBusinessSection>
    </>
  );
};

const MemoBusinessList = memo(BusinessList);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();

  const sort = sortOptions[0].value;

  const subcategory = context.query.name;
  const category = context.query.category;

  const params = {
    sort,
    ...(isString(subcategory) && { subcategory }),
    ...(isString(category) && { category }),
  };

  const queryKey = ['business', params];

  await queryClient.prefetchInfiniteQuery({
    queryKey,
    queryFn: () => fetchBusinesses(params),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default SearchBusiness;

SearchBusiness.getLayout = (page) => (
  <AppLayout size="lg">
    <NavigationProvider>
      <Navbar theme="light" />
      <Sidebar />
    </NavigationProvider>
    {page}
  </AppLayout>
);
