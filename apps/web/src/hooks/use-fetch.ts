import {
    useQuery,
    type DefaultError,
    type QueryClient,
    type QueryKey,
    type UseQueryOptions,
    type UseQueryResult,
} from "@tanstack/react-query"

export function useFetch<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
>(
    options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    queryClient?: QueryClient,
): UseQueryResult<NoInfer<TData>, TError> {
    return useQuery({ refetchOnWindowFocus: false, refetchOnMount: false, ...options }, queryClient)
}
