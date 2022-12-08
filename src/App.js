import React, {useEffect, useState} from 'react';
import {Amplify, Auth, Hub} from 'aws-amplify';
import awsconfig from './aws-exports';

import {
  Alert,
  AppLayout,
  Button,
  Box,
  Container,
  ContentLayout,
  Header,
  Link,
  SpaceBetween,
  SideNavigation,
  Spinner,
} from '@cloudscape-design/components';

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
      <h1>Things to try</h1>
      <p />
      You can use <Button onClick={() => Auth.federatedSignIn()}>
        Login
      </Button>{' '}
      to load the Hosted UI Or You can click{' '}
      <Button onClick={() => Auth.federatedSignIn({provider: 'customauth'})}>Passwordless</Button>{' '}
      to direclty start passwordless login<p />
      You may <Link>Sign Up</Link> first in the <Button onClick={() => Auth.federatedSignIn()}>Hosted UI</Button> if haven't done so
    </Box>
  );
};

const AuthedUser = () => {
  return (
    <Box>
      <h2>
        {' '}
        You can try <Button onClick={() => globalSignOut()}>Sign Out</Button>
      </h2>
    </Box>
  );
};

const AuthButton = ({user}) => {
  return user ? (
    <Button onClick={() => globalSignOut()}>Sign Out</Button>
  ) : (
    <div><Button onClick={() => Auth.federatedSignIn()}>Login</Button>
    {' '}
    <Button onClick={() => Auth.federatedSignIn({provider: 'customauth'})}>Passwordless</Button></div>
  );
};

const DispContent = ({loading, user}) => {
  if (loading) return <Spinner />;
  return user ? <AuthedUser user={user} /> : <UnauthedUser />;
};

const DispHeader = ({loading, user}) => {
  if (loading) return <p></p>;
  return user ? <p>Hi, {user.username}</p> : <p>Not User Signed In</p>;
};

const AppBody = ({loading, user}) => {
  return (
    <ContentLayout
      header={
        <SpaceBetween size='m'>
          <Header
            variant='h1'
            info={<Link>Info</Link>}
            description='Test SSO for different domains Applications.'
            actions={<AuthButton user={user} />}
          >
            I am Application TWO
          </Header>

          <Alert>
            This is a test application under domain{' '}
            <Link>http://{window.location.host}</Link>
          </Alert>
        </SpaceBetween>
      }
    >
      <Container
        header={
          <Header
            variant='h2'
            description={
              user
                ? "You've signed In Application TWO"
                : ""
            }
          >
            <DispHeader loading={loading} user={user} />
          </Header>
        }
      >
        <DispContent loading={loading} user={user} />
      </Container>
    </ContentLayout>
  );
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

  console.log('loading:', loading, ' user:', user);

  return (
    <AppLayout
      navigation={<SideNavigation />}
      navigationOpen={false}
      content={<AppBody loading={loading} user={user} />}
      toolsOpen={false}
      tools={null}
      onToolsChange={() => null}
      onNavigationChange={() => null}
    />
  );
}
