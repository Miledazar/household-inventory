// import AppBar from '@mui/material/AppBar';
// import Box from '@mui/material/Box';
// import Toolbar from '@mui/material/Toolbar';
// import Typography from '@mui/material/Typography';
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
// import * as React from 'react';
// import Drawer from '@mui/material/Drawer';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemText from '@mui/material/ListItemText';

// export default function MainLayout(){

//     const [open, setOpen] = React.useState(false);
    
//       const toggleDrawer = (newOpen: boolean) => () => {
//         setOpen(newOpen);
//       };
    
//       const pages = [
//         {name:'Categories'},
//         {name:'Brands'},
//         {name:'Stores'},
//         {name:'Items'},
//         {name:'Transactions'},
//         {name:'Grocery Lists'},
//         {name:'Dashboard'},
//       ];
      
//     return(
//     <>
//     <Box sx={{ flexGrow: 1 }}>
//       <AppBar position="static">
//         <Toolbar>
//           <IconButton
//             size="large"
//             edge="start"
//             color="inherit"
//             aria-label="menu"
//             sx={{ mr: 2 }}
//             onClick={toggleDrawer(true)}
//           >
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//             InventoryApp
//           </Typography>
          
//         </Toolbar>
//       </AppBar>
//     </Box>

//       <Drawer open={open} onClose={toggleDrawer(false)} variant='persistent'>
//           <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
//       <List>
//         {pages.map((text, index) => (
//           <ListItem key={index} disablePadding>
//             <ListItemButton>
//               <ListItemText primary={text.name} />
//             </ListItemButton>
//           </ListItem>
//         ))}
//       </List>
//     </Box>
//       </Drawer>
//     </>
//     )
// }


import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useLoading } from '@/context/LoadingContext';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}


const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));



export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
const {isLoading} = useLoading();
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

        const pages = [
        {label:'Dashboard', path: '/'},
        {label:'Items', path: '/items'},
        {label:'Transactions', path: '/transactions'},
        {label:'Grocery Lists', path: '/grocery-lists'},
        {label:'Categories', path: '/categories'},
        {label:'Brands', path: '/brands'},
        {label:'Stores', path: '/stores'},
      ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                mr: 2,
              },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            InventoryApp
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {pages.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton component={Link} to ={item.path} selected={location.pathname === item.path}>
                <ListItemText primary={item.label}/>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
       <Box sx={{ position: 'relative' }}>
    <Box
      sx={{
        opacity: isLoading ? 0.4 : 1,
        pointerEvents: isLoading ? 'none' : 'auto',
        transition: 'opacity 0.2s ease',
      }}
    >
      <Outlet />
    </Box>

    {isLoading && (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )}
  </Box>
      </Main>
    </Box>
  );
}
