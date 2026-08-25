import apiClient from '@/api/client';
import { Button,CircularProgress,IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from '@/context/SnackbarContext';
import FormDialog from '@/components/Dialog/FormDialog';
import type Store from '@/interfaces/IStore';
import SingleFormFields from '@/components/Dialog/SingleFormFields';
import { useLoading } from '@/context/LoadingContext';



type DialogMode = 'add' | 'edit' | 'view';

export default function Stores() {
  const {setIsLoading} = useLoading();
  const {showError, showSuccess} = useSnackbar();
  
  const [stores, setStores] = useState<Store[]>([]);

  //shared dialog state(add/edit/view)
  const[dialogOpen, setDialogOpen] = useState(false);
  const[mode, setMode] = useState<DialogMode>('add');
  const[storeName, setStoreName] = useState('');
  const [editingStoreId, setEditingStoreId] = useState<number | null>(null);
  const[isSubmitting, setIsSubmitting] = useState(false);
  const[isFetchingItem, setIsFetchingItem] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);


  useEffect(() => {
    apiClient.get('/stores')
    .then(res => setStores(res.data))
    .catch(() => showError('Failed to load stores.'))
    .finally(() => setIsLoading(false));
  },[])

  const columns: GridColDef<(typeof stores)[number]>[] = [
  {
    field: 'st_Name',
    headerName: 'Store Name',
    flex:1,
  
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

   

// create item
const handleOpen = () => {
  setMode('add');
  setStoreName('');
  setEditingStoreId(null);
  setDialogOpen(true);
}

//view / edit item - fetch the full item the open the dialog in the right mode
const loadItemIntoDialog = (id: number, targetMode: DialogMode) => {
  setMode(targetMode);
  setStoreName('');
  setDialogOpen(true);
  setEditingStoreId(id);
  setIsFetchingItem(true);
  apiClient.get(`/stores/${id}`)
  .then((res) => setStoreName(res.data.st_Name))
  .catch((err) => {
   const message = typeof err?.response?.data === 'string'
                        ? err.response.data
                        : 'Failed to load item.';
    showError(message);
    setDialogOpen(false);   
  })
  .finally(() => setIsFetchingItem(false));
}

const handleView = (id:number) => loadItemIntoDialog(id, 'view');
const handleEdit = (id: number) => loadItemIntoDialog(id, 'edit');

const handleDialogClose = () => {
  if(isSubmitting) return;
  setDialogOpen(false);
  setStoreName('');
  setEditingStoreId(null);
}

const handleAddSubmit = () => {
  setIsSubmitting(true);
  apiClient.post('/stores', {Name: storeName})
  .then((res) => {
    const newStore = {
      id: res.data.id,
      st_Name: storeName
    }
    setStores(prev => [...prev, newStore]);
    showSuccess('Store created successfully.');
    setDialogOpen(false);
  })
  .catch((err) => {
    const message = typeof err?.response?.data === 'string'
                    ? err.response.data:
                    'Failed to create store.';
    showError(message);
  })
  .finally(() => setIsSubmitting(false));
}

const handleEditSubmit = () => {
  if (editingStoreId === null) return; 
  setIsSubmitting(true);
  apiClient.put(`/stores/${editingStoreId}`, { Name: storeName })
    .then(() => {
      setStores(prev => prev.map(st =>
        st.id === editingStoreId ? { ...st, st_Name: storeName } : st
      ));
      showSuccess('Store updated successfully.');
      setDialogOpen(false);
    })
    .catch((err) => {
      const message = typeof err?.response?.data === 'string'
                    ? err.response.data
                    : 'Failed to update store.';
      showError(message);
    })
    .finally(() => setIsSubmitting(false));
};

const handleSubmit = () => {
  if(mode === 'view'){
    setDialogOpen(false);
    return;
  }
  if(mode === 'add') handleAddSubmit();
  if(mode === 'edit') handleEditSubmit();
}

  // delete item
   const handleDelete = (id: number) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog= () =>{
    setSelectedDeleteId(null);
    setDeleteDialogOpen(false);
  }

  const confirmDelete = async () => {
    if(selectedDeleteId === null) return;

    setIsDeleting(true);

    
    apiClient.delete(`stores/${selectedDeleteId}`)
    .then(() => {
    setStores((prev) => prev.filter((st) => st.id != selectedDeleteId));
    showSuccess('Store deleted succesfully');
    handleCloseDeleteDialog();})
    .catch((err) => {
      const message = typeof err?.response?.data === 'string'
                      ? err.response.data
                      : 'Failed to delete store.';
      showError(message)
    })    
    .finally(() => setIsDeleting(false));
  }

    const dialogTitle = mode === 'add' ? 'Add New Store' : mode === 'edit' ? 'Edit Store' : 'View Store';
    const submitLabel = mode === 'add' ? 'Add' : mode === 'edit' ? 'Save' : 'Close';
  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add New Store
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, width: '100%' }}>
      <DataGrid
        rows={stores}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
      />
      </Box>

      {/* Add / Edit / View Brand Dialog */}
      <FormDialog
      open={dialogOpen}
      onClose={handleDialogClose}
      title={dialogTitle}
      onSubmit={handleSubmit}
      submitLabel={submitLabel}
      isSubmitting={isSubmitting}
      isViewOnly={mode === 'view'}
    >
    {isFetchingItem ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    ) : (
      <SingleFormFields
        name={storeName}
        label='Brand Name'
        onNameChange={setStoreName}
        readOnly={mode === 'view'}
      />
    )}
    </FormDialog>

    {/* delete dialog */}
    <FormDialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} title='Confirm Delete' submitLabel='Delete' onSubmit={confirmDelete} isSubmitting={isDeleting}>
      Are you sure you want to delete this store? This action cannot be undone.
    </FormDialog>
  

    </Box>
  );
}

