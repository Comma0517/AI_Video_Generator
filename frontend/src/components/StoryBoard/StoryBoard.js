import React, { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import './StoryBoard.css';
import axios from 'axios';
import { Divider, Card, Button, Badge, Modal, Spin } from 'antd';
import { CheckCircleOutlined, EyeOutlined, DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { PDFExport } from "@progress/kendo-react-pdf";
import PDFStoryboard from '../PDFStoryboard';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
const API_HOST = process.env.REACT_APP_BASE_URL;

const StoryBoard = () => {    
    const token = Cookies.get('token');
    const user_id = Cookies.get('user_id');
    const history = useHistory();
    const routerStatus = useSelector(state => state);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [visible, setVisible] = useState(false);
    const [urlArray, setUrlArray] = useState([]);
    const [modelIndex, setModelIndex] = useState(0);
    const pdfExportComponent = React.useRef(null);

    useEffect(() => {
        if (token) {} else {
            history.push("/auth")
            // alert('Please log in on the site')
        }
    }, [token]);

    useEffect(() => {
        if (urlArray.length === 0){
            const scriptboard = JSON.parse(localStorage.getItem('scriptboard')) || [];

            if (localStorage.getItem('StoryImages') !== null){
                const storyImages = JSON.parse(localStorage.getItem('StoryImages')) || []; 
                storyImages[0] = localStorage.getItem('ImageOutput');
                localStorage.setItem('StoryImages', JSON.stringify(storyImages));
                setUrlArray(storyImages)
            } else {    
                const newArray = scriptboard.map((script, index) => 
                    index === 0 ? localStorage.getItem('ImageOutput') : 'noimage.png'
                );
                setUrlArray(newArray);
                localStorage.setItem('StoryImages', JSON.stringify(newArray))
            }
        } else {
            localStorage.setItem('StoryImages', JSON.stringify(urlArray))
        }
    }, [urlArray]);

    const downloadImage = async (path) => {
        try {
          const imageFetchResponse = await fetch(path);
          if (!imageFetchResponse.ok) throw new Error(`HTTP error! status: ${imageFetchResponse.status}`);
          
          const imageBlob = await imageFetchResponse.blob();
          const imageObjectURL = URL.createObjectURL(imageBlob);
          
          const anchor = document.createElement('a');
          anchor.href = imageObjectURL;
          anchor.download = `${localStorage.getItem('title')}.jpg`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
    
          // Release the object URL after the download is initiated
          URL.revokeObjectURL(imageObjectURL);
        } catch (error) {
          console.error('Download failed:', error);
        }
      };

    const showModal = () => {
        setVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const [scripts, setScripts] = useState(JSON.parse(localStorage.getItem('scriptboard')) || []);

    const generateImageID = async (prompt, index) => {
        setLoading(true);
    
        const body = {
            // image: index === 0 ? urlArray[index] : urlArray[index-1],
            prompt: prompt + `, Image style is ${localStorage.getItem('ImageStyle')}`,
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

          let image = '';
    
          for (let i=0;i<30;i++){
            await setTimeout(1000);
            const res = await axios.post(`${API_HOST}/api/scripts/getImageOutput`, dataBody);
            const { output, message } = res.data;            
            image = output;
            if (message === "succeeded" || message === "failed") break;
          }
          if (image !== ''){
            updateValue(image, index);
          }
        } catch (error) {
          console.error('Error generating image:', error);
        }
    
        setLoading(false);
      };

      const saveScripts = async () => {
        setLoading2(true);
    
        const body = {
            user_id: user_id,
            title: localStorage.getItem('title'),
            style: JSON.parse(localStorage.getItem('scriptPayload')),
            images: JSON.parse(localStorage.getItem('StoryImages')),
            script: JSON.parse(localStorage.getItem('scriptboard')),
        };
    
        try {
          const response = await axios.post(`${API_HOST}/api/scripts/save_library`, body);
    
        } catch (error) {
          console.error('Error generating image:', error);
        }
    
        setLoading2(false);
      };

      const updateValue = (newValue, index) => {
        const updatedArray = [...urlArray];
        updatedArray[index] = newValue;
        setUrlArray(updatedArray);
        if (index === 0) {
            localStorage.setItem('ImageOutput', newValue);
        }
      };

      const handleGenerateImageID = (currentIndex) => {
        // Retrieve the scripts array from local storage
        const scripts = JSON.parse(localStorage.getItem('scriptboard')) || [];
        
        // Check if the previous script exists and its status is 'To Review'
        if (currentIndex > 0 && scripts[currentIndex - 1].status === 'To Review') {
          alert("You have to approve the previous image");
        } else {
          generateImageID(scripts[currentIndex].visual, currentIndex);
        }
      }

    const approveScene = (index) => {
        const newScripts = [...scripts];
        newScripts[index].status = "Approved";
        setScripts(newScripts);
        localStorage.setItem('scriptboard', JSON.stringify(newScripts))
    };

    return (
        <div className="storyboard p-4 flex flex-col space-y-4">
            <div>
                <h2 className="text-lg">{localStorage.getItem('title')}</h2>
                <p className="text-xs">Script Title</p>
            </div>
            <Divider />

            <Modal open={visible} footer={null} onCancel={handleCancel} width={600}>
                <img alt="example" style={{ width: '100%', paddingTop: 20 }} src={urlArray[modelIndex]} />
            </Modal>

            <div className="grid grid-rows-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">

                {(JSON.parse(localStorage.getItem('scriptboard'))|| []).map((script, index) => (
                    <Badge.Ribbon key={index} text={script.status} color={script.status !== 'To Review' ? "cyan" : "purple"}>
                    <Card
                        className="shadow-lg h-full storycard"
                        title="Video Script"
                    >
                        <img src={JSON.parse(localStorage.getItem('StoryImages')) !== null ? JSON.parse(localStorage.getItem('StoryImages'))[index]: 'noimage.png'} onError={(e) => { e.target.src = 'noimage.png'; }} alt="Storyboard Image" className="w-full h-64 object-cover mb-4" />
                        <div className='flex justify-between mb-4'>
                            <Button icon={<EyeOutlined />} type="link" onClick={()=>{showModal(); setModelIndex(index)}}/>
                            <Button icon={<DownloadOutlined />} type="link" onClick={()=>downloadImage(JSON.parse(localStorage.getItem('StoryImages')) !== null ? JSON.parse(localStorage.getItem('StoryImages'))[index]:'')}/>
                            {!loading ?<Button icon={<SyncOutlined />} type="link" onClick={() =>handleGenerateImageID(index)}/>: <Spin />}
                        </div>
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
                        <div className='approveButton'>
                            {script.status === "To Review" && <Button type="primary" icon={<CheckCircleOutlined />} className="mt-4 w-full text-center" onClick={() => approveScene(index)}>Approve Scene</Button>}
                        </div>
                    </Card>
                    </Badge.Ribbon>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <Button type="primary" className="col-span-1 sm:col-span-2 md:col-span-1">Regenerate Visuals</Button>
                <Button type="dashed" danger className="col-span-1 sm:col-span-2 md:col-span-1"
                    onClick={() => {
                        if (pdfExportComponent.current) {
                            pdfExportComponent.current.save();
                        }
                    }}
                >Download PDF</Button>
                {(JSON.parse(localStorage.getItem('scriptboard')) || [])[0] ?
                    <div style={{ position: 'absolute', left: '-9999px' }}>
                        <PDFExport paperSize="A4" margin="2cm" ref={pdfExportComponent} fileName="Video Script">
                            <PDFStoryboard data={JSON.parse(localStorage.getItem('scriptboard'))} array={urlArray}/>
                        </PDFExport>
                    </div> : <></>}
                <Button type="primary" danger className="col-span-1 sm:col-span-2 md:col-span-1" onClick={()=>saveScripts()}>{!loading2 ? `Save and Exit` : <BeatLoader color="white" size={5} />}</Button>
                <Button type="default" className="col-span-1 sm:col-span-2 md:col-span-1">Start Over</Button>
            </div>
        </div>
    );
};

export default StoryBoard;