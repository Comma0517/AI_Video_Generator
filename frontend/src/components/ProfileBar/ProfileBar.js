import React from 'react';
import './ProfileBar.css';

const ProfileBar = () => {
  return (
    <div className="profile-bar flex-row justify-between">
      <p className="bg-green-50 font-bold text-lime-600 m-2 p-1">AI Images: 81</p>
      <img src={"profile.png"} alt="avatar" className="avatar-icon" />
    </div>
  );
};

export default ProfileBar;