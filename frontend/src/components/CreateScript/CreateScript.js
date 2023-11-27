import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, DatePicker, Select, Divider } from 'antd';
import 'tailwindcss/tailwind.css';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { useHistory } from 'react-router-dom';
const API_HOST = process.env.REACT_APP_BASE_URL;
const { Option } = Select;
const { TextArea } = Input;



const CreateScript = () => {
    const history = useHistory();
    const title = localStorage.getItem('title');
    const [script, setScript] = useState();
    const [vibe, setVibe] = useState();
    const [time, setTime] = useState();
    const [format, setFormat] = useState();
    const [cta, setCta] = useState();
    const [topic, setTopic] = useState();
    const [selectedDate, setSelectedDate] = useState();
    const [loding, setLoding] = useState(false);
    const [loding2, setLoding2] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('scriptPayload') !== null) {
            setScript(JSON.parse(localStorage.getItem('scriptPayload')).script)
            setVibe(JSON.parse(localStorage.getItem('scriptPayload')).vibe)
            setTime(JSON.parse(localStorage.getItem('scriptPayload')).time)
            setFormat(JSON.parse(localStorage.getItem('scriptPayload')).video_format)
            setCta(JSON.parse(localStorage.getItem('scriptPayload')).cta)
            setTopic(JSON.parse(localStorage.getItem('scriptPayload')).topic)
        }
    }, []);

    const clearData = () => {
        setScript()
        setVibe()
        setTime()
        setFormat()
        setCta()
        setTopic()
        setSelectedDate()
        localStorage.removeItem('scriptPayload');
    }

    const GetScript = async () => {
        setLoding(true)

        try {

            const scriptInfo = {
                title: title,
                topic: topic,
                vibe: vibe,
                video_format: format,
                time: time,
                cta: cta
            }

            const response = await axios.post(`${API_HOST}/api/scripts`, {
                data: scriptInfo,
            });

            const { str } = response.data;
            setScript(str)

            const scriptPayload = {
                topic: topic,
                vibe: vibe,
                video_format: format,
                time: time,
                cta: cta,
                script: str
            }

            localStorage.setItem('scriptPayload', JSON.stringify(scriptPayload))

        } catch (error) {
            console.error(error);
        }
        setLoding(false)
    };

    const GenerateScriptBoard = async () => {
        setLoding2(true)

        try {

            const response = await axios.post(`${API_HOST}/api/scripts/getVisualList`, {
                data: {script},
            });

            const { str } = response.data;
            localStorage.setItem('scriptboard', JSON.stringify(str))
            history.push("/scriptboards");

        } catch (error) {
            console.error(error);
        }
        setLoding2(false)
    };

    const onChangeDuration = (value) => {
        setTime(value)
    };

    const onChangeFormat = (value) => {
        setFormat(value)
    };

    const onChangeVibe = (value) => {
        setVibe(value)
    };

    return (
        <div className="storyboard p-4 flex flex-col space-y-4">
            <div>
                <h2 className="text-lg">{title}</h2>
                <p className="text-xs">Script Title</p>
            </div>
            <Divider />
            <h3 className="text-xl">Tell us about the script you would like:</h3>
            <Divider />

            <div className="flex flex-wrap justify-between md:flex-nowrap space-y-2 md:space-y-0">
                <Select className="w-full md:w-auto md:flex-1 mr-0 md:mr-2" placeholder="Video Duration"
                    onChange={onChangeDuration}
                    value={time}
                    options={[
                        { value: '30 seconds', label: '30 seconds' },
                        { value: '60 seconds', label: '60 seconds' },
                        { value: '2 minutes', label: '2 minutes' },
                        { value: '5 minutes', label: '5 minutes' },
                    ]}
                >
                    {/* Add options dynamically */}
                </Select>

                <Select className="w-full md:w-auto md:flex-1 mr-0 md:mr-2" placeholder="Video Format"
                    onChange={onChangeFormat}
                    value={format}
                    options={[
                        { value: 'Youtube', label: 'Youtube' },
                        { value: 'TicTok Clip', label: 'TicTok Clip' },
                        { value: 'Instargram Reel', label: 'Instargram Reel' },
                        { value: 'LinkedIn Post', label: 'LinkedIn Post' },
                    ]}
                >
                    {/* Add options dynamically */}
                </Select>

                <Select className="w-full md:w-auto md:flex-1 mr-0 md:mr-2" placeholder="Script Vibe / Tone"
                    onChange={onChangeVibe}
                    value={vibe}
                    options={[
                        { value: 'Casual', label: 'Casual' },
                        { value: 'Professional', label: 'Professional' },
                        { value: 'Funny', label: 'Funny' },
                        { value: 'Informative', label: 'Informative' },
                        { value: 'Creative', label: 'Creative' },
                    ]}
                >
                    {/* Add options dynamically */}
                </Select>

                <Input className="w-full md:w-auto md:flex-1 mr-0 md:mr-2" placeholder="Call to Action" value={cta} onChange={(e) => setCta(e.target.value)} />

                <DatePicker className="w-full md:w-auto md:flex-1" value={selectedDate} onChange={setSelectedDate} />
            </div>

            <TextArea
                className="mt-2"
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="OK tell us about your script here. You can use prompts or simply write out in detail what needs to be included in the script. Better tell us more, than less."
            />

            <div className='w-30'>
                <Button type="primary" onClick={GetScript}>{!loding ? 'Generate Script' : <BeatLoader color="white" size={5} />}</Button>
            </div>

            <TextArea rows={10} placeholder="Your Script" value={script} onChange={(e) => setScript(e.target.value)} />

            <div className="flex justify-end space-x-2">
                <Button type="primary" danger onClick={GenerateScriptBoard}>{!loding2 ? `I'm happy. Create a ScriptBoard` : <BeatLoader color="white" size={5} />}</Button>
                <Button onClick={clearData}>Clear</Button>
            </div>
        </div>
    );
};

export default CreateScript;