import React from 'react';
import { Container, Typography, Button, Box } from "@mui/material";
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';

const BackgroundContainer = styled(Box)({
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
});

const WelcomeMessage = styled(Typography)({
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
});

const SubMessage = styled(Typography)({
    fontSize: '1.25rem',
    marginBottom: '2rem',
});

const StyledButton = styled(Button)({
    backgroundColor: '#ff4081',
    color: '#fff',
    '&:hover': {
        backgroundColor: '#ff79b0',
    },
    margin: '0 1rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
});

function LandingPage() {
    return (
      <BackgroundContainer>
        <Container maxWidth="sm">
          <WelcomeMessage>
            Bienvenue sur Tissu Master!
          </WelcomeMessage>
          <SubMessage>
            Gérez vos stocks de tissus avec facilité et efficacité.
          </SubMessage>
          <Box>
            <StyledButton component={Link} to="/login">
              Connexion
            </StyledButton>
          </Box>
        </Container>
      </BackgroundContainer>
    );
  }
  

export default LandingPage;
