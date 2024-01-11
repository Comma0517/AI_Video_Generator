import React, { useState } from 'react';
import { Divider, Card, Button, Modal } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

const LibraryComponent = (props) => {
    
    const history = useHistory();
    let source={title: '', create_date: '', images: null, script: []};

    if (!props.location.state){
        history.push("/libraries")
    } else {
        source = props.location.state.script;
    }

    const [visible, setVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const convertToReadableDateTime = (isoString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(isoString).toLocaleDateString('en-US', options);
    };

    const showModal = () => {
        setVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    
    const downloadImage = async (path) => {
        try {
          const imageFetchResponse = await fetch(path);
          if (!imageFetchResponse.ok) throw new Error(`HTTP error! status: ${imageFetchResponse.status}`);
          
          const imageBlob = await imageFetchResponse.blob();
          const imageObjectURL = URL.createObjectURL(imageBlob);
          
          const anchor = document.createElement('a');
          anchor.href = imageObjectURL;
          anchor.download = `${source.title}.jpg`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
    
          // Release the object URL after the download is initiated
          URL.revokeObjectURL(imageObjectURL);
        } catch (error) {
          console.error('Download failed:', error);
        }
      };

    return (
        <div className="storyboard p-4 flex flex-col space-y-4">
            <div>
                <h2 className="text-lg">{source.title}</h2>
                <p className="text-xs">{convertToReadableDateTime(source.create_date)}</p>
            </div>
            <Divider />

            <Modal open={visible} footer={null} onCancel={handleCancel} width={600}>
                <img alt="example" style={{ width: '100%', paddingTop: 20 }} src={source.images !== null ? (source.images)[selectedImageIndex]: 'https://myvscript.s3.us-east-2.amazonaws.com/tmp/noimage.png'} />
            </Modal>

            <div className="grid grid-rows-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">

                {(source.script).map((item, index) => (
                    <Card
                        className="shadow-lg h-full storycard"
                        title="Video Script"
                        key={index}
                    >
                        <img src={source.images !== null ? (source.images)[index]: 'https://myvscript.s3.us-east-2.amazonaws.com/tmp/noimage.png'} onError={(e) => { e.target.src = 'https://myvscript.s3.us-east-2.amazonaws.com/tmp/noimage.png'; }} alt="Storyboard Image" className="w-full h-64 object-cover mb-4" />
                        <div className='flex justify-between mb-4'>
                            <Button icon={<EyeOutlined />} type="link" onClick={()=>{showModal(); setSelectedImageIndex(index)}}/>
                            <Button icon={<DownloadOutlined />} type="link" onClick={()=>downloadImage(source.images !== null ? (source.images)[index]:'')}/>
                        </div>
                        <div className='flex flex-col space-y-4'>
                            <div>
                                <p className="text-xs font-semibold">Action:</p>
                                <p className="text-xs">{item.visual}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold">Voice Over Script:</p>
                                <p className="text-xs">{item.audio}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
  };
  
  export default LibraryComponent;