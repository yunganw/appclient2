import React, {useEffect, useState} from 'react';
import {Amplify, Auth, Hub} from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);


async function globalSignOut() {
    
    try {
        await Auth.signOut();
        await Auth.signOut({ global: true });
    } catch (error) {
        console.log('error signing out: ', error);
    }
}

const UnauthedUser = () => {
    return (
        <div>
            <h1>Application2</h1>
            You have not signed in yet.<p/>
            <button onClick={() => Auth.federatedSignIn()}>
                Open Hosted UI
            </button>
        </div>
    );
};

const AuthedUser = (user) => {
  console.log ('user:', user);
    return (
        <div>
          <h1> Hi {user.user.username}</h1>
          You've signed in to Application 2 <p/>
            <p/>
            <button onClick={() => globalSignOut()}>
                Sign Out
            </button>
        </div>
    );
};

const Loading = () => {
    return (<div id="loading"></div>);
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = Hub.listen('auth', ({payload: {event, data}}) => {
            switch (event) {
                case 'signIn':
                    setLoading(false);
                    setUser(data);
                    break;
                case 'signOut':
                    setLoading(false);
                    setUser(null);
                    break;
                default:
                    break;
            }
        });

        setLoading(true);
        Auth.currentAuthenticatedUser()
            .then((currentUser) => {setUser(currentUser); setLoading(false)})
            .catch(() => {setLoading(false);console.log('Not signed in')});

        return unsubscribe;
    }, []);

    // return <Loading />;
    return loading ? <Loading /> : (user ? <AuthedUser user={user}/> : <UnauthedUser />);
}
