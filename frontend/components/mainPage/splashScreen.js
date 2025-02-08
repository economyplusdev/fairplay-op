function SplashScreen() {
    return (
      <div className="max-w-2xl mx-auto">

        <div className="flex justify-center gap-2 mt-4 flex-col items-center">
          <div className="flex justify-center gap-4">
            <a href="https://discord.com/application-directory/1028476352401248406" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out w-32 h-10">
              Invite Bot
            </a>
            <a href="https://discord.com/invite/XhSEqgFxkW" className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out w-32 h-10">
              Support
            </a>
          </div>
        </div>
      </div>
    )
  }
  
  export default SplashScreen;