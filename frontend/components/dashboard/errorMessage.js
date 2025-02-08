// components/dashboard/ErrorMessage.js

export default function ErrorMessage({ message, onRetry }) {
    return (
        <div className="flex items-center justify-center p-4 sm:p-0">
            <div className="bg-red-500 bg-opacity-20 text-white p-4 rounded-lg max-w-lg mx-auto shadow-xl sm:w-auto">
                <div className="flex flex-col items-start space-y-4">
                    <h1 className="font-bold text-lg flex items-center">
                        <span className="text-xl mr-2">⚠️</span> An error occurred.
                    </h1>
                    <p>Possible solutions:</p>
                    <ul className="list-disc ml-4 space-y-2">
                        <li>Are you connected to the internet?</li>
                        <li>Try logging out and logging back in.</li>
                        <li>If the issue persists, contact support for assistance.</li>
                    </ul>
                    <div className="w-full bg-gray-800 bg-opacity-40 p-4 rounded-lg">
                        <p className="font-medium text-sm text-gray-300">
                            <span className="font-semibold text-white">Error Details: </span>
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onRetry}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        RETRY
                    </button>
                </div>
            </div>
        </div>
    );
}
