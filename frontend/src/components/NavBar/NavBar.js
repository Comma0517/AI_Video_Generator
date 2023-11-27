import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';
import {
  FundProjectionScreenOutlined,
  ReadOutlined,
  HighlightOutlined,
  SettingOutlined,
  SolutionOutlined,
  QuestionCircleOutlined,
  PictureOutlined,
  InboxOutlined 
} from '@ant-design/icons';
import { saveRouterStatus } from '../../store/actions/routerStatusAction';

const NavBar = () => {
  return (
    <div className="nav-bar md:fixed md:h-screen">
      <div className='flex sm: gap-2 md:gap-6 lg:gap-8 flex-start items-center pb-8'>
        <img src={"that.png"} alt="avatar" className="that-icon" />
        <p className='text-blue-600 font-bold text-xl'>vScript</p>
      </div>
      <NavLink to="/dashboard" activeClassName="active-link" ><FundProjectionScreenOutlined className="iconStyle" />Dashboard</NavLink>
      <NavLink to="/scripts" activeClassName="active-link" ><ReadOutlined className="iconStyle" />Create Scripts</NavLink>
      <NavLink to="/scriptboards" activeClassName="active-link" ><HighlightOutlined className="iconStyle" /> Scriptboard</NavLink>
      <NavLink to="/storyboards" activeClassName="active-link" ><PictureOutlined className="iconStyle" /> Storyboard</NavLink>
      <NavLink to="/libraries" activeClassName="active-link" ><InboxOutlined className="iconStyle"/> My library</NavLink>
      <NavLink to="/settings" activeClassName="active-link" ><SettingOutlined className="iconStyle"/> My Settings</NavLink>
      <NavLink to="/feature" activeClassName="active-link"><SolutionOutlined className="iconStyle"/> Suggest a feature</NavLink>
      <button className="support-button"><QuestionCircleOutlined/>Support</button>
    </div>  
  );
};

export default NavBar;