// src/styles/theme.js
import { createTheme } from '@mui/material/styles';
import { deepPurple, amber } from '@mui/material/colors'; // Example colors

const theme = createTheme({
  palette: {
    mode: 'light', // Start with light mode, can be toggled later
    primary: {
      main: deepPurple[500], // Example primary color
      contrastText: '#ffffff',
    },
    secondary: {
      main: amber[700], // Example secondary color
      contrastText: '#000000',
    },
   // In theme.js
background: {
  default: '#ffffff', // Solid white
  paper: '#ffffff',   // Solid white
},
    // Add other color customizations if needed
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    // Add other typography customizations
  },
  spacing: 8, // Default spacing unit (factor)
  shape: {
    borderRadius: 8, // Slightly rounded corners for components
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1536, // MUI v5 default xl breakpoint
    },
  },
  components: {
    // Example: Global style overrides for specific components
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Semi-transparent AppBar
          backgroundColor: 'rgba(81, 45, 168, 0.8)', // Adjust primary color with alpha
          backdropFilter: 'blur(5px)', // Optional blur effect
          boxShadow: 'none', // Cleaner look, adjust as needed
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Keep button text case as defined
          fontWeight: 600,
        },
      },
      defaultProps: {
         disableElevation: true, // Flat buttons by default
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          // Slightly transparent cards
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(3px)', // Optional subtle blur
        },
      },
    },
    MuiPaper: {
       styleOverrides: {
        root: {
           // Already defined in palette.background.paper, ensure consistency
           backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }
       }
    }
    // Add more component overrides as needed
  },
});

export default theme;