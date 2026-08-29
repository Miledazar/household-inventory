import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await apiClient.post("auth/register", {
        name,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data === "string"
          ? err.response.data
          : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 360, mx: "auto", mt: 10 }}>
      <Typography variant="h5" sx={{ mb: 2 }} align="center">
        Register
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          required
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          required
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth>
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Register"
          )}
        </Button>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Already have an account? <Link to="/login">Login</Link>
        </Typography>
      </form>
    </Box>
  );
}
