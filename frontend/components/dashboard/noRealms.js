export default function noRealms({ message, guildID }) {
    return (
        <div className="flex items-center justify-center p-4 sm:p-0">
            <div className="bg-red-500 bg-opacity-20 text-white p-4 rounded-lg max-w-lg mx-auto shadow-xl sm:w-auto">
                <div className="flex flex-col items-start space-y-4">
                    <h1 className="font-bold text-lg flex items-center">
                        <span className="text-xl mr-2">⚠️</span> It seems as if you have not setup fairplay yet
                    </h1>
                    <p>Possible solutions:</p>
                    <ul className="list-disc ml-4 space-y-2">
                        <li>Is the account your linking above the age of 18?</li>
                        <li>Is the account communication/enforcement suspended?</li>
                        <li>Does the account own a realm?</li>
                        <li>Clear browser cache/try opening this page in incognito</li>
                    </ul>
                    <div className="w-full bg-gray-800 bg-opacity-40 p-4 rounded-lg">
                        <p className="font-medium text-sm text-gray-300">
                            <span className="font-semibold text-white">Error Details: </span>
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.href = `http://localhost:1112/api/create/xbox?guildID=${guildID}`}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Link Account
                    </button>
                </div>
            </div>
        </div>
    );
}
