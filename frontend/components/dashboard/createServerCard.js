export default function ServerCard({ guild }) {
    const hasBanner = Boolean(guild.banner);
    const hasIcon = Boolean(guild.icon);

    return (
        <div key={guild.id} className="m-4">
            <div
                className={[
                    'p-4',
                    'rounded-lg',
                    'w-64',
                    'h-48',
                    'flex',
                    'flex-col',
                    'items-center',
                    'justify-center',
                    'relative',
                    hasBanner || hasIcon
                        ? 'bg-white bg-opacity-60 backdrop-filter backdrop-blur-xl'
                        : 'bg-gray-900',
                ].join(' ')}
                style={{
                    backgroundSize: 'cover',
                }}
            >
                {(hasBanner || hasIcon) && (
                    <div
                        style={{
                            backgroundImage: hasBanner
                                ? `url(https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=512)`
                                : `url(https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png)`,
                            filter: 'blur(5px) brightness(40%)',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: -1,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                )}

                <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center border-2 border-gray-500">
                    {hasIcon ? (
                        <img
                            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                            alt="guild icon"
                            className="text-white text-2xl rounded-full"
                            style={{ objectFit: 'contain' }}
                        />
                    ) : (
                        <span className="text-white text-2xl rounded-full p-1">
                            <strong>{guild.name[0]}</strong>
                        </span>
                    )}
                </div>
            </div>

            <div className="w-64 flex justify-between mt-4">
                <h2 className="text-1xl mb-2">
                    <strong>{guild.name}</strong>
                </h2>
                <button
                    className={`${
                        guild.setup ? 'bg-green-600' : 'bg-blue-600'
                    } w-20 h-8 px-4 py-2 rounded hover:bg-opacity-300 transition duration-300 flex items-center justify-center`}
                    onClick={() =>
                        (window.location.href = `/dashboard/${guild.id}?create=${
                            guild.setup ? 'false' : 'true'
                        }`)
                    }
                >
                    {guild.isSetup ? 'Manage' : 'Setup'}
                </button>
            </div>
        </div>
    );
}
