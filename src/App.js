import React, {useEffect, useState} from 'react';
import {Amplify, Auth, Hub} from 'aws-amplify';
import awsconfig from './aws-exports';

// import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
// import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Box from "@cloudscape-design/components/box";
import Spinner from "@cloudscape-design/components/spinner";


Amplify.configure(awsconfig);

async function globalSignOut() {
    try {
        await Auth.signOut();
        await Auth.signOut({global: true});
    } catch (error) {
        console.log('error signing out: ', error);
    }
}

const UnauthedUser = () => {
    return (
        <Box>
            <h1>Application2</h1>
            You have not signed in yet.
            <p />
            <Button onClick={() => Auth.federatedSignIn()}>
                Open Hosted UI
            </Button>
        </Box>
    );
};

const AuthedUser = (user) => {
    console.log('user:', user);
    return (
        <div>
            <h1> Hi {user.user.username}</h1>
            You've signed in to Application 2 <p />
            <p />
            <Button onClick={() => globalSignOut()}>Sign Out</Button>
        </div>
    );
};

const AppBody = ({loading, user}) => {
    if (loading) return <Spinner />;
    return user ? <AuthedUser user={user} /> : <UnauthedUser />;
};

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
            .then((currentUser) => {
                setUser(currentUser);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                console.log('Not signed in');
            });

        return unsubscribe;
    }, []);

    console.log ('loading:', loading, ' user:', user);

    return (
        <Container>
            <AppBody loading={loading} user={user} />
        </Container>
    );
}
