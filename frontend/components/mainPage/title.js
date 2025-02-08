"use client"

import { ReactTyped } from 'react-typed';

function Title() {
  const textStrings = [
    'Ingame Utility',
    'Invite players from discord',
    'Moderation from discord',
    'Log ingame events',
    'Talk from discord to your realm'
  ];

  return (
    <div className="text-6xl font-bold text-center">
      <div className="gradient-text" style={{ overflow: 'hidden' }}>
        <ReactTyped
          strings={textStrings}
          typeSpeed={100}
          backSpeed={50}
          loop
        />
      </div>
    </div>
  );
}

export default Title;