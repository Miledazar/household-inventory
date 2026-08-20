import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";

export default function Login(){
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit= async (e : SyntheticEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try{
            const response = await apiClient.post('auth/login', {name, password});
            localStorage.setItem('access_token', response.data.token);
            navigate('/');
        }catch{
            setError("Invalid username or password");
        }finally{
            setIsLoading(false);
        }
    }
    return ( 
    <Box sx={{ maxWidth: 360, mx: 'auto', mt: 10 }}>
      <Typography variant="h5" sx={{ mb: 2 }} align="center">Login</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Name" required fullWidth value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Password" type="password" required fullWidth value={password} onChange={(e) => setPassword(e.target.value)}  sx={{ mb: 2 }} />
        <Button type="submit" variant="contained" fullWidth>
            {isLoading? <CircularProgress size={24} color="inherit" />: 'Login'}
        </Button>
        <Typography variant="body2">
          No account? <Link to="/register">Register</Link>
        </Typography>
      </form>
    </Box>
    )
}