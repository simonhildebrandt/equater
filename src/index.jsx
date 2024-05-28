import "@babel/polyfill";

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

import { withUser, sendSignInLink, handleSigninLink, logout } from './firebase';
// import { useRouter, navigate } from './router';
import { Base, Switch, Route, Redirect, getRouter } from "navigo-react";


const routeDefaults = { page: null }

const App = () => {
  const {user, loginData} = withUser();

  useEffect(_ => {
    const {next} = loginData || {};
    if (next) {
      getRouter().navigate(next);
    }
  }, [loginData]);

  console.log({user, loginData})
  return user === null ? 'resolving' : <UserResolved user={user}/>
};

const UserResolved = ({user}) => {
  console.log('rendering resolved!')

return <>
    <Switch>
      <Route path="/authed">
        Authed
      </Route>
      <Route path="/">
        Root
      </Route>
    </Switch>
    <Main user={user}/>
  </>
}

const Main = ({user}) => {
  function handleLogin() {
    const url = new URL(window.location.href);
    const next = url.searchParams.get('next') || '/';
    sendSignInLink('simonhildebrandt@gmail.com', next);
  }

  function handleLogout() {
    const url = new URL(window.location.href);
    logout().then(getRouter().navigate('/?next=' + encodeURIComponent(url.pathname)))
  }

  return <div>
    {JSON.stringify({user})}
    <a href="/authed" data-navigo>Authed page</a>
    <a href="/" data-navigo>Main page</a>
    { user == false ? (
      <button onClick={handleLogin}>Login</button>
    ) : (
      <button onClick={handleLogout}>Logout</button>
    )
    }
  </div>

}

ReactDOM.render(<App/>, document.getElementById('app'));
