import React from 'react'
import { Divider, Toolbar, Typography, Box, Grid, Paper, Link } from '@mui/material'
import { styled } from '@mui/system'

// Feature Box Styling
const FeatureBox = styled(Paper)(({ theme }) => ({
  borderRadius: '10px',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.7)', // Transparent background
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
  },
}))

// Footer Section Styling
const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: '#121212', // Deep black background for footer
  color: 'white',
  padding: theme.spacing(4, 2), // Added horizontal padding
  marginTop: theme.spacing(6),
  borderRadius: '10px',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  textAlign: 'center',
  fontFamily: '"Roboto", sans-serif',
  display: 'flex',
  justifyContent: 'center', // Centers content horizontally
  flexDirection: 'row', // Layout for equal split of columns
  alignItems: 'flex-start',
}))

// Footer Column Styling
const FooterColumn = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  textAlign: 'left',
  flex: 1, // Ensures both columns have equal width
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
}))

// Link Styling in Footer for interaction
const FooterLink = styled(Link)(({ theme }) => ({
  color: 'white',
  textDecoration: 'none',
  '&:hover': {
    color: '#f4a261', // Light color on hover
    textDecoration: 'underline',
  },
}))

export default function Home() {
  return (
    <>
      {/* Toolbar */}
      <Box 
        sx={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'auto', // Full viewport height
          textAlign: 'center', // Center the text
          backgroundColor: '#f4f4f4', // Optional background color
          paddingTop: 2,
        }}
      >
        <Typography 
          variant='h4' 
          sx={{
            fontWeight: 'bold',
            color: '#000',
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          Features of MEEWOO BANK
        </Typography>
      </Box>
      <Divider />

      {/* Centered Container for Features */}
      <Box 
        sx={{
          padding: 4, 
          display: 'flex', 
          justifyContent: 'center',
          marginTop: 4, 
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', 
          borderRadius: '10px', 
          backgroundColor: '#fff',
        }}
      >
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <FeatureBox>
              <Typography variant="h6">Easy Transactions</Typography>
              <Typography variant="body2">Make seamless transfers and manage your bank accounts with ease.</Typography>
            </FeatureBox>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FeatureBox>
              <Typography variant="h6">24/7 Support</Typography>
              <Typography variant="body2">Our customer support team is available around the clock to assist you.</Typography>
            </FeatureBox>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FeatureBox>
              <Typography variant="h6">Secure Banking</Typography>
              <Typography variant="body2">Your account security is our priority, with top-notch encryption.</Typography>
            </FeatureBox>
          </Grid>
        </Grid>
      </Box>

      {/* Footer Section */}
      <Footer>
        <Grid container spacing={4} justifyContent="center">
          {/* About Section */}
          <FooterColumn item xs={12} sm={6}>
            <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: 16 }}>
              About
            </Typography>
            <Typography variant="body2" style={{ marginBottom: 8 }}>
              We are a customer-centric bank focused on providing innovative financial solutions. 
              Our mission is to deliver exceptional service and help our customers reach their financial goals.
            </Typography>
            <FooterLink href="https://www.mybank.com/about">Learn More</FooterLink>
          </FooterColumn>

          {/* Contact Section */}
          <FooterColumn item xs={12} sm={6}>
            <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: 16 }}>
              Contact
            </Typography>
            <Typography variant="body2" style={{ marginBottom: 8 }}>
              <strong>Email:</strong> <FooterLink href="mailto:support@mybank.com">support@mybank.com</FooterLink>
            </Typography>
            <Typography variant="body2" style={{ marginBottom: 8 }}>
              <strong>Phone:</strong> <FooterLink href="tel:+123456789">+123 456 789</FooterLink>
            </Typography>
          </FooterColumn>
        </Grid>
      </Footer>

      {/* Divider and All Rights Reserved */}
      <Divider sx={{ margin: '20px 0', backgroundColor: '#000' }} /> {/* Darker divider */}
      <Box sx={{ textAlign: 'center',fontWeight:'bold', color: 'black', paddingBottom: 2 }}>
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          &copy; 2025 My Bank. All Rights Reserved.
        </Typography>
      </Box>
    </>
  )
}
