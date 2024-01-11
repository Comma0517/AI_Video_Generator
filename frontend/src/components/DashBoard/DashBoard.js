import React, { useState } from 'react';
import { Button, Card, Modal, Input, message } from 'antd';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import './DashBoard.css';
import { useDispatch } from 'react-redux';
import { saveScriptTitle } from '../../store/actions/routerStatusAction';

const DashBoard = () => {
  const token = Cookies.get('token');
  const history = useHistory();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [titleInput, setTitleInput] = useState('');  
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();

  const warning = () => {
    messageApi.open({
      type: 'warning',
      content: 'Please log in on the site.',
    });
  };


  const showModal = () => {
    if (token){
      setIsModalVisible(true);
    } else {
      warning();        
      setTimeout(() => {  
        history.push('/auth');
      }, 1500);
    }
  };

  const handleOk = () => {
    if (titleInput.trim()) {
      dispatch(saveScriptTitle(titleInput));
      localStorage.setItem('title', titleInput);
      history.push('/scripts');
      setIsModalVisible(false);
    } else {
      // Handle the case where title input is empty
      alert('Please enter a title for the script.');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="storyboard p-4 ">
      {contextHolder}
      <Modal title="Create a Script & Storyboard" open={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null} width={300}>
        <p>Please give your script a title first:</p>
        <Input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} placeholder="Enter the title" />
        <Button style={{ marginLeft: 130 }} type="primary" onClick={handleOk} className="mt-4">Save and Next</Button>
      </Modal>
      <h1 className="title">Start a new project</h1>
      <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-20 mt-8'>
        <div className='col-span-1 flex md:justify-end'>
          <Card
            hoverable
            style={{
              width: 240,
            }}
            className='project-card'
            cover={<img alt="example" src="video.png" style={{ width: 240, height: 160 }} />}
          >
            <div className='meta'>
              <p style={{ fontSize: 18, paddingBottom: '30px', color: 'gray', fontWeight: 'bold' }}>Watch Onboarding Video</p>
              <Button size={12} >Watch</Button>
            </div>
          </Card>
        </div>
        <div className='col-span-1'>
          <Card
            hoverable
            style={{
              width: 240,
            }}
            className='project-card'
            cover={<img alt="example" src="storyboard.jpg" style={{ width: 240, height: 160 }} />}
          >
            <div className='meta'>
              <p style={{ fontSize: 18, color: 'gray', fontWeight: 'bold' }}>I need to create a script and storyboard</p>
              <p style={{ fontSize: 12, paddingBottom: '30px', color: 'gray' }}>from scratch</p>
              <Button size={12} onClick={showModal}>Start</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;