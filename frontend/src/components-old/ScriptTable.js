import React, { useState } from 'react';
import '../App.css';
import { Table } from 'antd';
const API_HOST = process.env.REACT_APP_BASE_URL;

const columns = [
    {
        title: 'Scene',
        dataIndex: 'Scene',
    },
    {
        title: 'Visual',
        dataIndex: 'Visual',
    },
    {
        title: 'Audio',
        dataIndex: 'Audio',
    },
];

const ScriptTable = (props) => {

    const data = [
        {
            key: '1',
            Scene: props.id + 1,
            Visual: props.data.visual,
            Audio: props.data.audio,
        }
    ];

    return (
        <div className='card_item'>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                bordered
            />
        </div>
    );
};

export default ScriptTable;