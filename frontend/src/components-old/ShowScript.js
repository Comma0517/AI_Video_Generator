import React, { useState, useRef } from 'react';
import '../App.css';
import axios from 'axios';
import { Input, Button, Select, message, Spin } from 'antd';
import copy from "copy-to-clipboard";
import { CopyOutlined, LoadingOutlined, DownloadOutlined } from "@ant-design/icons";
import * as ReactDOM from "react-dom";
import { PDFExport } from "@progress/kendo-react-pdf";
import PDFTemplate from './PDFTemplate';
import Boardblock from "./Boardblock"
import ScriptTable from "./ScriptTable"
const API_HOST = process.env.REACT_APP_BASE_URL;

const { TextArea } = Input;
const antIcon = (
  <LoadingOutlined
    style={{
      fontSize: 24,
    }}
    spin
  />
);


const ShowScript = () => {
  const [script, setScript] = useState();
  const [topic, setTopic] = useState();
  const [vibe, setVibe] = useState("Casual");
  const [video_format, setVideo_format] = useState("Youtube");
  const [flag, setFlag] = useState(0);
  const [visualFlag, setVisualFlag] = useState(0);
  const [standfor, setStandfor] = useState();
  const [visualList, setVisualList] = useState([]);
  const [time, setTime] = useState("30 seconds");
  const [cta, setCta] = useState();
  const [messageApi, contextHolder] = message.useMessage();
  const buttons = ['Casual', 'Professional', 'Funny', 'Informative', 'Creative'];
  const pdfExportComponent = React.useRef(null);


  const copyToClipboard = () => {
    if (script) {
      copy(script);
      copyScript();
    }
  }

  const GetStory = async () => {
    if (script) {

      try {

        const scriptInfo = {
          script: script
        }

        const response = await axios.post(`${API_HOST}/api/scripts/getScreenScripts`, {
          data: scriptInfo,
        });

        const { str } = response.data;
        // const jsonObjects = str.split('\n');
        // for (let i=0; i<jsonObjects.length; i++){
        //   console.log(jsonObjects[i].screen, "scriptscript")
        // }

      } catch (error) {
        console.error(error);
      }
    }
  }

  const GetVisualList = async () => {
    if (script) {
      setVisualFlag(1)
      try {

        const scriptInfo = {
          script: script
        }

        const response = await axios.post(`${API_HOST}/api/scripts/getVisualList`, {
          data: scriptInfo,
        });

        const { str } = response.data;
        setVisualList(str);
        setVisualFlag(0);
      } catch (error) {
        setVisualFlag(0);
        console.error(error);
      }
    } else {
      NoScript();
    }
  }

  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'Generated video script',
    });
  };

  const info = () => {
    messageApi.open({
      type: 'info',
      content: 'Input all Feilds',
    });
  };

  const NoScript = () => {
    messageApi.open({
      type: 'info',
      content: 'You have to create a Script',
    });
  };

  const copyScript = () => {
    messageApi.open({
      type: 'info',
      content: 'You have copied Video Script',
    });
  };

  const GetScript = async () => {
    if (!topic || !cta) {
      info();
    } else {
      try {

        setFlag(1);

        const scriptInfo = {
          topic: topic,
          vibe: vibe,
          video_format: video_format,
          time: time,
          cta: cta
        }

        setScript('');

        const response = await axios.post(`${API_HOST}/api/scripts`, {
          data: scriptInfo,
        });

        const { str } = response.data;
        setFlag(0);
        setScript(str)
        success();
        setStandfor(topic);

      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleChange = (value) => {
    setVideo_format(value)
  };

  const handleChangeTime = (value) => {
    setTime(value)
  };

  return (
    <div className="ShowScript">
      {contextHolder}
      <div className="container">
        <div className="row">
          <div className="col-md-12 padding-top ">
            <br />
            <h2 className="display-3 text-center">AI Video Script Generator</h2>
            <h2 className="sub-text">Use AI to generate scripts for your videos for free!</h2>
          </div>

          <div className="col-md-12 padding-top padding-side">
            <h2 className="sub-title">Video Topic</h2>
            <TextArea value={topic} onChange={(e) => setTopic(e.target.value)} autoSize={{ minRows: 2 }} placeholder="e.g. The best beach for beginner surfers in Europe." />
          </div>

          <div className="col-md-12 padding-top padding-side">
            <h2 className="sub-title">Select your vibe</h2>
            {buttons.map((btnVibe, index) => (
              <Button
                key={index}
                onClick={() => setVibe(btnVibe)}
                // applies a different style if current button is the selected vibe
                style={vibe === btnVibe ? { backgroundColor: 'beige' } : null}
              >
                {btnVibe}
              </Button>
            ))}
          </div>

          <div className="col-md-12 padding-top padding-side">
            <h2 className="sub-title">Video Format</h2>
            <Select
              style={{ width: "100%" }}
              onChange={handleChange}
              value={video_format}
              // status="warning"
              options={[
                { value: 'Youtube', label: 'Youtube' },
                { value: 'TicTok Clip', label: 'TicTok Clip' },
                { value: 'Instargram Reel', label: 'Instargram Reel' },
                { value: 'LinkedIn Post', label: 'LinkedIn Post' },
              ]}
            />
          </div>

          <div className="col-md-12 padding-top padding-side">
            <h2 className="sub-title">Time Length</h2>
            <Select
              style={{ width: "100%" }}
              onChange={handleChangeTime}
              value={time}
              // status="warning"
              options={[
                { value: '30 seconds', label: '30 seconds' },
                { value: '60 seconds', label: '60 seconds' },
                { value: '2 minutes', label: '2 minutes' },
                { value: '5 minutes', label: '5 minutes' },
              ]}
            />
          </div>

          <div className="col-md-12 padding-top padding-side">
            <h2 className="sub-title">Call to Action</h2>
            <TextArea value={cta} onChange={(e) => setCta(e.target.value)} autoSize={{ minRows: 2 }} placeholder="e.g. Visit our website for more information." />
          </div>

          <div className="col-md-8 padding-top2">
            {flag === 0 ? <button onClick={() => GetScript()} className="btn btn-outline-warning float-right sub-title">
              Create Script <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="h-4 w-4" height="0.7em" width="0.7em" xmlns="http://www.w3.org/2000/svg"><path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path></svg>
            </button>
              : <button className="btn btn-outline-warning float-right sub-title">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden ">Generating...</span>
                </div>

              </button>}

          </div>

          <div className="col-md-12 padding-top2 padding-side">
            <h2 className="sub-title">Your script for: {standfor}</h2>
            <div className="textarea-container">
              <CopyOutlined onClick={copyToClipboard} className="copy-icon" />
              <TextArea value={script} onChange={(e) => setScript(e.target.value)} autoSize={{ minRows: 10 }} placeholder="" />
            </div>
          </div>

          <div className="col-md-12 padding-side">
            <button className='btn_footer' onClick={() => GetScript()}>Try another scirpt</button>
            {visualFlag === 1 ? <button className='btn_footer'><Spin indicator={antIcon} /></button>
              : <button className='btn_footer' onClick={() => GetVisualList()}>Generate Visual Suggestion</button>}
            <button className='btn_footer' onClick={() => GetStory()}>Generate Storyboard</button>
          </div>

        </div>
      </div>

      {visualList[0] ? <div>
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "20px", paddingRight: "50px" }}>
          <Button type="primary" shape="round" icon={<DownloadOutlined />} size={'large'}
            onClick={() => {
              if (pdfExportComponent.current) {
                pdfExportComponent.current.save();
              }
            }}>
            Download PDF
          </Button>
        </div>
      </div> : <></>}

      <div>
        <div className='board_content'>
          {visualList.map((list, index) =>
            <ScriptTable data={list} id={index} key={index} />
          )}
        </div>
      </div>
      {visualList[0] ?
        <div style={{ position: 'absolute', left: '-9999px' }}>
          <PDFExport paperSize="A4" margin="2cm" ref={pdfExportComponent} fileName="Video Script">
            <PDFTemplate data={visualList} />
          </PDFExport>
        </div> : <></>}

    </div>
  );
};

export default ShowScript;