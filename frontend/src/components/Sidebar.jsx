import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Sidebar = ({ user, currentChannel, onChannelSelect, publicChannels, privateChannels }) => {
    return (
        <div className="w-64 bg-indigo-500 text-white flex flex-col">
            <h2 className="text-xl font-bold p-4 border-b border-indigo-700">Bonjour, {user.username}</h2>
            <ul className="flex-grow overflow-y-auto">
                {/* Canaux publics */}
                {publicChannels.map((channel) => (
                    <li
                        key={channel}
                        className={`p-4 cursor-pointer ${
                            channel === currentChannel ? 'bg-indigo-700' : 'hover:bg-indigo-600'
                        }`}
                        onClick={() => onChannelSelect(channel)}
                    >
                        {channel}
                    </li>
                ))}

                {/* Canaux privés */}
                {privateChannels.map((privateChannel, index) => (
                    <li
                        key={index}
                        className={`p-4 cursor-pointer ${
                            privateChannel === currentChannel ? 'bg-blue-700' : 'hover:bg-blue-600'
                        }`}
                        onClick={() => onChannelSelect(privateChannel)}
                    >
                        {privateChannel}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;