interface UseLoadingStateProps {
  isLoading: boolean;
  isError: boolean;
  loadingText?: string;
  errorMsg?: string;
}

export const useLoading = ({
  isLoading,
  isError,
  loadingText = "Loading...",
  errorMsg = "Error loading data",
}: UseLoadingStateProps) => {
  if (isLoading) {
    return (
      <div className="p-6 text-gray-600 animate-reverse-pulse">
        {loadingText}
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-red-500">{errorMsg}</div>;
  }

  return null;
};
