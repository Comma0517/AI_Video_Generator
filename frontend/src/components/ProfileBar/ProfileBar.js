import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './ProfileBar.css';

const ProfileBar = () => {
  const history = useHistory();
  const username = localStorage.getItem('username')
  const [user_name, setUsername] = useState('');

  useEffect(() => {
    setUsername(username)
}, [username]);

  const handleImageClick = () => {
      history.push('/auth');
  };

  return (
    <div className="profile-bar flex-row justify-between">
      <p className="bg-green-50 font-bold text-lime-600 m-2 p-1">AI Images: 81</p>
      <div className="textareas">
        <img
          src={"profile.png"}
          alt="avatar"
          className="avatar-icon"
          onClick={handleImageClick} // Set the click handler
        />
        <div className='text-blue-500 font-medium'>{!user_name? "Log In" : user_name}</div>      
      </div>
    </div>
  );
};

export default ProfileBar;