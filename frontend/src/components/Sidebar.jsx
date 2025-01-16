import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Sidebar = ({ user, currentChannel, onChannelSelect }) => {
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        const fetchChannels = async () => {
            const res = await axios.get('http://localhost:5000/api/rooms/list');
            setChannels(res.data.filter((ch) => user.channels.includes(ch.name)));
        };
        fetchChannels();
    }, [user]);

    return (
        <div className="w-64 bg-blue-500 text-white flex flex-col">
            <h2 className="text-xl font-bold p-4 border-b border-blue-700">Canaux</h2>
            <ul className="flex-grow overflow-y-auto">
                {channels.map((channel) => (
                    <li
                        key={channel._id}
                        className={channel.name === currentChannel ? 'active' : ''}
                        onClick={() => onChannelSelect(channel.name)}
                    >
                        {channel.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;