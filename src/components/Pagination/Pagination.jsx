export default function Pagination({ currentPage, setCurrentPage, totalPages }) {
  const goPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const baseBtnStyle = "flex items-center justify-center h-10 px-4 text-sm font-medium transition-colors duration-200 border";

  return (
    <nav aria-label="Page navigation" className="flex justify-center mt-8">
      <ul className="inline-flex -space-x-px shadow-sm rounded-md">
        <li>
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className={`${baseBtnStyle} rounded-l-lg border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Previous
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, idx) => {
          const page = idx + 1;
          const isActive = page === currentPage;
          return (
            <li key={page}>
              <button
                onClick={() => setCurrentPage(page)}
                aria-current={isActive ? "page" : undefined}
                className={`${baseBtnStyle} w-10 border-gray-300 ${
                  isActive
                    ? "z-10 bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                {page}
              </button>
            </li>
          );
        })}

        <li>
          <button
            onClick={goNext}
            disabled={currentPage === totalPages}
            className={`${baseBtnStyle} rounded-r-lg border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}