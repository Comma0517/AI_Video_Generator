import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import ProfileBar from './components/ProfileBar/ProfileBar';
import NavBar from './components/NavBar/NavBar';
import DashBoard from './components/DashBoard/DashBoard';
import CreateScript from './components/CreateScript/CreateScript';
import ScriptBoard from './components/ScriptBoard/ScriptBoard';
import StoryBoard from './components/StoryBoard/StoryBoard';
import MyLibrary from './components/MyLibrary.js/MyLibrary';
import LibraryComponent from './components/libraryComponent';
import Auth from './components/auth/auth';
import './App.css';

function App() {
  
  return (
    <Router>
  <div className="App">
    <NavBar />
    <div className="main-content gap-2 p-2 md:gap-4 md:p-4 lg:gap-6 lg:p-6 md:ml-[220px]">
      <ProfileBar />
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
        <Route path="/dashboard" component={DashBoard} />
        <Route path="/scripts" component={CreateScript} />
        <Route path="/scriptboards" component={ScriptBoard} />
        <Route path="/storyboards" component={StoryBoard} />
        <Route exact path="/libraries" component={MyLibrary} />
        <Route path="/libraries/:index" component={LibraryComponent} />         
        <Route path="/auth" component={Auth} />
      </Switch>
    </div>
  </div>
</Router>
  );
}

export default App;