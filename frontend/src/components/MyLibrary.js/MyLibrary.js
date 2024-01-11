import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Input, Button, Card, Select, Divider } from 'antd';
import { BeatLoader } from 'react-spinners';
import 'tailwindcss/tailwind.css';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
const API_HOST = process.env.REACT_APP_BASE_URL;

const MyLibrary = () => {    
    const token = Cookies.get('token');
    const user_id = Cookies.get('user_id');
    const history = useHistory();
    const [libArray, setLibArray] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {} else {
            history.push("/auth")
            // alert('Please log in on the site')
        }
    }, [token]);

    useEffect(() => {
        getLibraries();
    }, []);

    const getLibraries = async () => {
        setLoading(true)

        const body = {
            userId: user_id
        };

        try {
            const response = await axios.post(`${API_HOST}/api/scripts/libraries`, body);
            if (response.data) {
                setLibArray(response.data)
            }
        } catch (error) {
            console.error('Error generating image:', error);
        }
        setLoading(false)
    };

    const truncateString = (str, num) => {
        if (str.length > num) {
            return str.slice(0, num) + '...';
        } else {
            return str;
        }
    }

    const convertToReadableDateTime = (isoString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(isoString).toLocaleDateString('en-US', options);
    }


    return (
        <div className="storyboard p-4 flex flex-col space-y-4">
            <h3 className="text-xl">My library:</h3>
            <Divider />

            {!loading?<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                {libArray.map((script, index) => (
                    <Card
                        key={index}
                        className="shadow-lg"
                        title={
                            <div className='flex flex-col'>
                                <span className="text-l">{truncateString(script.title ? script.title : 'Script', 20)}</span>
                                <span className="text-xs text-gray-400">{convertToReadableDateTime(script.create_date)}</span>
                            </div>
                        }
                        extra={
                            <div className="space-x-2">
                                <Link
                                    to={{
                                        pathname: `/libraries/${index}`,
                                        state: { script: script }
                                    }}
                                    key={index}
                                >
                                    <Button type="primary" icon={<EyeOutlined />} size="small" />
                                </Link>
                                <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                            </div>
                        }
                    >
                        <div className='flex flex-col space-y-4'>
                            <div>
                                <p className="text-xs font-semibold">Video Duration:</p>
                                <p className="text-xs pl-1">{script.style.time}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold">Video Format:</p>
                                <p className="text-xs pl-1">{script.style.video_format}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold">Script Vibe / Tone:</p>
                                <p className="text-xs pl-1">{script.style.vibe}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold">Script Prompt:</p>
                                <p className="text-xs ">{script.style.topic}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>:<BeatLoader color="#3C7BFC" size={15} />}
        </div>

    );
};

export default MyLibrary;