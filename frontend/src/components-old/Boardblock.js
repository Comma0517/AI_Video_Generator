import React, { useState } from 'react';
import '../App.css';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Card } from 'antd';
const { Meta } = Card;
const API_HOST = process.env.REACT_APP_BASE_URL;

const Boardblock = () => {
    return (
        <div className='card_item'>
            <Card
                style={{
                    width: '100%'
                }}
                cover={
                    <img
                        alt="example"
                        // src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                        src="noimage.jpg"
                    />
                }
                actions={[
                    <SettingOutlined key="setting" />,
                    <EditOutlined key="edit" />,
                    <EllipsisOutlined key="ellipsis" />,
                ]}
            >
                <Meta
                    title="Subject"
                    description="This is the description,This is the description, This is the description, This is the description, This is the description"
                />
            </Card>
        </div>
    );
};

export default Boardblock;