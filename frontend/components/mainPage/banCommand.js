'use client';

import React from 'react';
import {
    DiscordDefaultOptions,
    DiscordEmbed,
    DiscordMessage,
    DiscordMessages,
    DiscordOptionsContext,
} from '@discord-message-components/react';
import '@discord-message-components/react/styles';

const discordOptions = {
    ...DiscordDefaultOptions,
    profiles: {
        sanc: {
            author: 'Fairplay',
            avatar: 'https://cdn.economyplus.solutions/logo.png',
            roleColor: '#0099ff',
            bot: true,
            verified: true,
            officialApp: true,
        },
        brylan: {
            author: 'brylan',
            avatar: 'https://cdn.economyplus.solutions/brylan.png',
            roleColor: '#ff4500',
            bot: false,
            verified: false,
            officialApp: false,
        },
    },
};

export default function banCommand() {
    return (
        <DiscordOptionsContext.Provider value={discordOptions}>
            <div className="text-left">
                <DiscordMessages>
                    <DiscordMessage profile="brylan">
                        <DiscordEmbed fieldTitle="Command" inline={true}>
                            <span style={{ fontWeight: 'bold' }}>&lt;brylan&gt;</span>
                            &nbsp;<code>/realm-ban @troublesomeUser</code>
                        </DiscordEmbed>
                    </DiscordMessage>
                    <DiscordMessage profile="sanc">
                        <DiscordEmbed fieldTitle="Response" inline={true} color="#a855fa">
                            <span style={{ fontWeight: 'bold' }}>&lt;Fairplay&gt;</span>
                            &nbsp;User @troublesomeUser has been banned.
                        </DiscordEmbed>
                    </DiscordMessage>
                </DiscordMessages>
            </div>
        </DiscordOptionsContext.Provider>
    );
}
