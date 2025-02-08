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
    },
};

export default function DiscordMessagesComponent() {
    return (
        <DiscordOptionsContext.Provider value={discordOptions}>
            <div className="text-left">
                <DiscordMessages>

                    <DiscordMessage profile="sanc">
                        <DiscordEmbed fieldTitle="embeds" inline={true} color="#a855fa">
                            <span style={{ fontWeight: 'bold' }}>&lt;Vik11047&gt;</span>
                            &nbsp;Anyone got any wood?
                        </DiscordEmbed>

                        <DiscordEmbed fieldTitle="embeds" inline={true}>
                            <span style={{ fontWeight: 'bold' }}>&lt;CRT FAGRONZ&gt;</span>
                            &nbsp;Yeah, I got some wood.
                        </DiscordEmbed>

                        <DiscordEmbed fieldTitle="embeds" inline={true}>
                            <span style={{ fontWeight: 'bold' }}>&lt;Vik11047&gt;</span>
                            &nbsp;Can I have some?
                        </DiscordEmbed>
                    </DiscordMessage>

                </DiscordMessages>
            </div>
        </DiscordOptionsContext.Provider>
    );
}
