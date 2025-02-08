export default function NoServersMessage() {
    return (
        <div className="flex items-center justify-center p-4 sm:p-0">
            <div className="bg-red-500 bg-opacity-20 text-white p-4 rounded-lg max-w-lg mx-auto shadow-xl sm:w-auto">
                <div className="flex flex-col items-start space-y-4">
                    <h1 className="font-bold text-lg flex items-center">
                        <span className="text-xl mr-2">⚠️</span> No servers you can manage.
                    </h1>
                    <p>In order to be able to manage a server, you need to be either:</p>
                    <ul className="list-disc ml-4 space-y-2">
                        <li>The physical server owner of the server</li>
                        <li>An administrator in the server you are attempting to manage</li>
                    </ul>
                    <p>Is the server you are looking for freshly made?</p>
                    <button
                        onClick={() => location.reload()}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        REFRESH
                    </button>
                </div>
            </div>
        </div>
    );
}
