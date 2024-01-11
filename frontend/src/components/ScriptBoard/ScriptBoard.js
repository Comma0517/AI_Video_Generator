import React, { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import axios from 'axios';
import { Divider, Card, Button, Modal, Input } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BeatLoader } from 'react-spinners';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { PDFExport } from "@progress/kendo-react-pdf";
import PDFTemplate from '../PDFTemplate';
import Cookies from 'js-cookie';
const API_HOST = process.env.REACT_APP_BASE_URL;

// Custom hook
function useResizeObserver(ref) {
    const [dimensions, setDimensions] = useState(null);

    useEffect(() => {
        const observeTarget = ref.current;
        const resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                setDimensions(entry.contentRect);
            });
        });
        resizeObserver.observe(observeTarget);
        return () => {
            resizeObserver.unobserve(observeTarget);
        };
    }, [ref]);
    return dimensions;
}


const ScriptBoard = () => {
    const token = Cookies.get('token');
    const history = useHistory();
    const ref = useRef();
    useResizeObserver(ref);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loding2, setLoding2] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState("Hand Sketch");
    const [scriptJson, setScriptJson] = useState([]);
    const pdfExportComponent = React.useRef(null);

    useEffect(() => {
        if (token) {} else {
            history.push("/auth")
            // alert('Please log in on the site')
        }
    }, [token]);

    useEffect(() => {
        const storedScriptJson = localStorage.getItem('scriptboard');
        if (storedScriptJson) {
            setScriptJson(JSON.parse(storedScriptJson));
        } else {
            // If there's nothing in localStorage, default to an empty array
            setScriptJson([]);
        }
    }, []);


    const showModal = () => {
        localStorage.removeItem('StoryImages')
        localStorage.setItem('ImageStyle', 'Hand Sketch')
        setIsModalVisible(true);
    };

    const handleOk = () => {
        generateImageID()
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleStyleClick = (style) => {
        setSelectedStyle(style);
    };

    const deleteScript = (index) => {
        const filteredArray = scriptJson.filter((_, idx) => idx !== index);
        localStorage.setItem('scriptboard', JSON.stringify(filteredArray));
        setScriptJson(filteredArray);
    };


    const styleButtons = ["Hand Sketch", "Comic Book", "2D Isometric", "Photo Realistic", "Pixel Art", "Sharpee Marker", "3D Model"].map((style, index) => (
        <Button
            key={index}
            type={selectedStyle === style ? "primary" : "default"}
            className="m-1"
            onClick={() => {handleStyleClick(style); localStorage.setItem('ImageStyle', style);}}
        >
            {style}
        </Button>
    ));

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                // process the resize event
            }
        });

        // Ensure resize callback is not called in excess
        setTimeout(() => {
            resizeObserver.observe(document.body);
        });

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        }
    }, []);

    const generateImageID = async () => {
        setLoading(true);
    
        const body = {
            prompt: scriptJson[0].visual + `, Image style is ${localStorage.getItem('ImageStyle')}`,
            negative_prompt:'ugly, bad anatomy, distorted proportions, dull, unclear, no hands, no fingers, no legs, no eyes, no mouse',
            height: 512,
            width: 512,
            refine: "expert_ensemble_refiner",
            scheduler: "K_EULER",
            lora_scale: 0.6,
            num_outputs: 1,
            guidance_scale: 7.5,
            apply_watermark: false,
            high_noise_frac: 0.8,
            prompt_strength: 0.8,
            num_inference_steps: 25
        };
    
        try {
          const response = await axios.post(`${API_HOST}/api/scripts/text-image`, body);
    
          const { imageID } = response.data;
          const dataBody = {
            id: imageID
          };
    
          for (let i=0;i<30;i++){
            await setTimeout(1000);
            const res = await axios.post(`${API_HOST}/api/scripts/getImageOutput`, dataBody);
            const { output, message } = res.data;
            localStorage.setItem('ImageOutput', output);
            if (message === "succeeded") break;
          }
          setIsModalVisible(false);
          history.push("/storyboards");
        } catch (error) {
          console.error('Error generating image:', error);
        }
    
        setLoading(false);
      };


    const GenerateScriptBoard = async () => {
        setLoding2(true)

        try {

            const scriptInfo = {
                script: JSON.parse(localStorage.getItem('scriptPayload')).script,
            }

            const response = await axios.post(`${API_HOST}/api/scripts/getVisualList`, {
                data: scriptInfo,
            });

            const { str } = response.data;
            localStorage.setItem('scriptboard', JSON.stringify(str))
            setScriptJson(str)

        } catch (error) {
            console.error(error);
        }
        setLoding2(false)
    };

    return (
        <div ref={ref} className="storyboard p-4 flex flex-col space-y-4">
            <Modal
                title="Tell us what style of images would you like:"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="submit" type="primary" danger onClick={handleOk}>
                        {!loading?'Create Now':<BeatLoader color="white" size={5} />}
                    </Button>,
                    <Button key="back" type="dashed" danger onClick={handleCancel}>
                        Quit and Start Over
                    </Button>,
                ]}
            >
                <div className="p-2">
                    {styleButtons}
                </div>
            </Modal>
            <div>
                <h2 className="text-lg">{localStorage.getItem('title')}</h2>
                <p className="text-xs">Script Title</p>
            </div>
            <Divider />
            <h3 className="text-xl">Your Visual Suggestions:</h3>
            <Divider />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
                {scriptJson.map((script, index) => (
                    <Card
                        key={index}
                        className="shadow-lg"
                        title={
                            <div className='flex flex-col'>
                                <span className="text-l">Script</span>
                                <span className="text-xs text-gray-400">{`Frame${index + 1}`}</span>
                            </div>
                        }
                        extra={
                            <div className="space-x-2">
                                <Button type="primary" icon={<EditOutlined />} size="small" />
                                <Button type="primary" danger icon={<DeleteOutlined />} onClick={()=>deleteScript(index)} size="small" />
                            </div>
                        }
                    >
                        <div className='flex flex-col space-y-4'>
                            <div>
                                <p className="text-xs font-semibold">Action:</p>
                                <p className="text-xs">{script.visual}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold">Voice Over Script:</p>
                                <p className="text-xs">{script.audio}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <Button type="primary" className="col-span-1 sm:col-span-2 md:col-span-1" onClick={GenerateScriptBoard}>{!loding2 ? `Regenerate Visuals` : <BeatLoader color="white" size={5} />}</Button>
                <Button type="dashed" danger className="col-span-1 sm:col-span-2 md:col-span-1"
                    onClick={() => {
                        if (pdfExportComponent.current) {
                            pdfExportComponent.current.save();
                        }
                    }}
                >Download PDF</Button>
                {scriptJson[0] ?
                    <div style={{ position: 'absolute', left: '-9999px' }}>
                        <PDFExport paperSize="A4" margin="2cm" ref={pdfExportComponent} fileName="Video Script">
                            <PDFTemplate data={scriptJson} />
                        </PDFExport>
                    </div> : <></>}
                {<Button type="primary" danger className="col-span-1 sm:col-span-2 md:col-span-1" onClick={showModal}>I'm happy. Create a Storyboard</Button>}
                <Button type="default" className="col-span-1 sm:col-span-2 md:col-span-1">Start Over</Button>
            </div>
        </div>
    );
};

export default ScriptBoard;