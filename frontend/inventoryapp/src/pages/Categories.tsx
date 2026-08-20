import apiClient from '@/api/client';
import type Category from '@/interfaces/ICategories';
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';





export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');


  const [open, setOpen] = useState(false);

  // 2. State for the form inputs
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/categories')
    .then(res => setCategories(res.data))
    .catch(() => setError('Failed to load categories.'))
    .finally(() => setIsLoading(false));
  },[])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

   if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const columns: GridColDef<(typeof categories)[number]>[] = [
  {
    field: 'cat_Name',
    headerName: 'Category Name',
    flex:1,
  
  },
  {
    field: 'cat_Description',
    headerName: 'Description',
    flex:2,
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,
    filterable: false,
    headerAlign: 'right',
    align: 'right',
   
    renderCell: (params) => {
        return (
            <>
            <IconButton color='success' onClick={() => handleView(params.row.id)}>
                <VisibilityIcon/>
            </IconButton>
            <IconButton color='primary' onClick={() => handleEdit(params.row.id)}>
                <EditIcon />
            </IconButton>
            <IconButton color='error' onClick={() => handleDelete(params.row.id)}>
                <DeleteIcon />
            </IconButton>
            </>
        );
    }
  },

];

  const handleView = (id: number) => {console.log(id)};
  const handleEdit = (id: number) => {console.log(id)};
  const handleDelete = (id: number) => {console.log(id)};
   


  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setCatName('');
    setCatDescription('');
  };


  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!catName.trim()) {
    setErrorMessage('Category name cannot be empty.');
    return;
  }

    setLoading(true);
    setErrorMessage('');
    
   try {
    const response = await apiClient.post('/categories', { 
      cat_Name: catName, 
      cat_Description: catDescription 
    });

    const newCategory = {
      id: response.data.id,
      cat_Name: catName,
      cat_Description: catDescription
    };

    setCategories((prevCategories) => [...prevCategories, newCategory]);

    handleClose(); 

  } catch (error: any) {
   
    console.error('Failed to create category:', error);
    const message = error.response?.data?.message || 'Failed to save category. Please try again.';
    setErrorMessage(message);

  } finally {
    setLoading(false);
  }
  };
  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add New Category
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, width: '100%' }}>
      <DataGrid
        rows={categories}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[5]}
        disableRowSelectionOnClick
      />
      </Box>

      {/* Dialog */}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogContent>
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Alert>
                )}
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              type="text"
              fullWidth
              variant="outlined"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              margin="dense"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

