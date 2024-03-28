import React from 'react'
import { useSelector } from 'react-redux'
import './profile.css'

function Profile() {
    const { userInfo } = useSelector((state) => state.auth)
  return (
    <div className="user-details">
      <div className="user-info">
        <label htmlFor="firstName">First Name</label>
        <input type="text" id="firstName" />
      </div>
      <div className="user-info">
        <label htmlFor="lastName">Last Name</label>
        <input type="text" id="lastName" />
      </div>
      <div className="user-info">
        <label htmlFor="username">Username</label>
        <input type="text" id="username" />
      </div>
      <div className="user-info">
        <label htmlFor="bio">Bio</label>
        <textarea id="bio"></textarea>
      </div>
      <div className="user-info">
        <label htmlFor="mobileNumber">Mobile Number</label>
        <input type="tel" id="mobileNumber" />
      </div>
      <div className="user-info">
        <label htmlFor="gender">Gender</label>
        <select id="gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="user-info">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" />
      </div>
      <button className="save-button">Save All</button>
    </div>
  )
}

export default Profile




