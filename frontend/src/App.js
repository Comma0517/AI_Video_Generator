import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ProfileBar from './components/ProfileBar/ProfileBar';
import NavBar from './components/NavBar/NavBar';
import DashBoard from './components/DashBoard/DashBoard';
import CreateScript from './components/CreateScript/CreateScript';
import ScriptBoard from './components/ScriptBoard/ScriptBoard';
import StoryBoard from './components/StoryBoard/StoryBoard';
import './App.css';

function App() {
  
  return (
    <Router>
  <div className="App">
    <NavBar />
    <div className="main-content gap-2 p-2 md:gap-4 md:p-4 lg:gap-6 lg:p-6 md:ml-[220px]">
      <ProfileBar />
      <Switch>
        <Route path="/dashboard" component={DashBoard} />
        <Route path="/scripts" component={CreateScript} />
        <Route path="/scriptboards" component={ScriptBoard} />
        <Route path="/storyboards" component={StoryBoard} />
      </Switch>
    </div>
  </div>
</Router>
  );
}

export default App;