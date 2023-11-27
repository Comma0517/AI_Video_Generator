import React, { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import './StoryBoard.css';
import { Divider, Card, Button, Badge, Modal } from 'antd';
import { CheckCircleOutlined, EyeOutlined, DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { PDFExport } from "@progress/kendo-react-pdf";
import PDFStoryboard from '../PDFStoryboard';

const StoryBoard = () => {
    const routerStatus = useSelector(state => state);
    const [visible, setVisible] = useState(false);
    const pdfExportComponent = React.useRef(null);

    const showModal = () => {
        setVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const [scripts, setScripts] = useState(JSON.parse(localStorage.getItem('scriptboard')));

    const approveScene = (index) => {
        const newScripts = [...scripts];
        newScripts[index].status = "Approved";
        setScripts(newScripts);
        console.log(newScripts)
        localStorage.setItem('scriptboard', JSON.stringify(newScripts))
    };
    return (
        <div className="storyboard p-4 flex flex-col space-y-4">
            <div>
                <h2 className="text-lg">{localStorage.getItem('title')}</h2>
                <p className="text-xs">Script Title</p>
            </div>
            <Divider />

            <Modal visible={visible} footer={null} onCancel={handleCancel} width={1100}>
                <img alt="example" style={{ width: '100%', paddingTop: 20 }} src="sample.jpg" />
            </Modal>

            <div className="grid grid-rows-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                {JSON.parse(localStorage.getItem('scriptboard')).map((script, index) => (
                    <Badge.Ribbon key={index} text={script.status} color={script.status !== 'To Review' ? "cyan" : "purple"}>
                    <Card
                        className="shadow-lg h-full storycard"
                        title="Video Script"
                    >
                        <img src="sample.jpg" alt="Storyboard Image" className="w-full h-64 object-cover mb-4" />
                        <div className='flex justify-between mb-4'>
                            <Button icon={<EyeOutlined />} type="link" onClick={showModal}/>
                            <Button icon={<DownloadOutlined />} type="link" />
                            <Button icon={<SyncOutlined />} type="link" />
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
                {JSON.parse(localStorage.getItem('scriptboard'))[0] ?
                    <div style={{ position: 'absolute', left: '-9999px' }}>
                        <PDFExport paperSize="A4" margin="2cm" ref={pdfExportComponent} fileName="Video Script">
                            <PDFStoryboard data={JSON.parse(localStorage.getItem('scriptboard'))} />
                        </PDFExport>
                    </div> : <></>}
                <Button type="primary" danger className="col-span-1 sm:col-span-2 md:col-span-1">Save and Exit</Button>
                <Button type="default" className="col-span-1 sm:col-span-2 md:col-span-1">Start Over</Button>
            </div>
        </div>
    );
};

export default StoryBoard;