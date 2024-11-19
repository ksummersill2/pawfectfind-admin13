import React, { useState } from 'react';
import { Plus, Upload, Download, CheckCircle, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBreeds } from '../hooks/useBreeds';
import { AdminBreedForm } from '../types';
import { BreedList } from '../components/breeds';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import ImportConfirmationModal from '../components/common/ImportConfirmationModal';
import ActionMenu from '../components/common/ActionMenu';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminSupabase } from '../../lib/supabase/client';
import Papa from 'papaparse';

interface ImportState {
  isOpen: boolean;
  breedName: string;
  rowData: any;
  resolve?: (value: boolean) => void;
}

const AdminBreeds: React.FC = () => {
  const { breeds, loading, error: fetchError, deleteBreed, refreshBreeds } = useBreeds();
  const [error, setError] = useState<string | null>(fetchError);
  const [breedToDelete, setBreedToDelete] = useState<AdminBreedForm | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importConfirmation, setImportConfirmation] = useState<ImportState>({
    isOpen: false,
    breedName: '',
    rowData: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Filter breeds based on search query
  const filteredBreeds = breeds.filter(breed => 
    breed.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!breedToDelete?.id || isDeleting) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      const success = await deleteBreed(breedToDelete.id);
      if (success) {
        setBreedToDelete(null);
      } else {
        throw new Error('Failed to delete breed');
      }
    } catch (err) {
      console.error('Error deleting breed:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete breed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBreeds.length === 0 || isDeleting) return;

    try {
      setIsDeleting(true);
      setError(null);

      for (const breedId of selectedBreeds) {
        await deleteBreed(breedId);
      }

      setSelectedBreeds([]);
    } catch (err) {
      console.error('Error deleting breeds:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete breeds');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectBreed = (breedId: string) => {
    setSelectedBreeds(prev => 
      prev.includes(breedId)
        ? prev.filter(id => id !== breedId)
        : [...prev, breedId]
    );
  };

  const handleSelectAll = () => {
    setSelectedBreeds(prev => 
      prev.length === breeds.length
        ? []
        : breeds.map(breed => breed.id!)
    );
  };

  const handleDownloadTemplate = () => {
    fetch('/src/admin/data/breeds-template.csv')
      .then(response => response.text())
      .then(csvContent => {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'breeds-template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(err => {
        console.error('Error downloading template:', err);
        setError('Failed to download template');
      });
  };

  const importBreed = async (row: any) => {
    try {
      const { data: existingBreed } = await adminSupabase
        .from('dog_breeds')
        .select('id')
        .eq('name', row.name)
        .single();

      if (existingBreed) {
        return new Promise<boolean>((resolve) => {
          setImportConfirmation({
            isOpen: true,
            breedName: row.name,
            rowData: row,
            resolve
          });
        });
      }

      // Process and import the breed data
      const breedData = {
        name: row.name,
        description: row.description,
        // Add other breed fields as needed
      };

      const { error: insertError } = await adminSupabase
        .from('dog_breeds')
        .insert([breedData]);

      if (insertError) throw insertError;

      return true;
    } catch (err) {
      console.error('Error importing breed:', err);
      throw err;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);
    setError(null);
    setImportStatus('Starting import process...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const { data, errors } = results;
          if (errors.length > 0) {
            throw new Error('CSV parsing failed: ' + errors[0].message);
          }

          setImportStatus(`Found ${data.length} breeds to import`);
          const total = data.length;
          let processed = 0;
          let hasErrors = false;

          for (const row of data) {
            try {
              setImportStatus(`Processing breed ${processed + 1} of ${total}`);
              await importBreed(row);
              processed++;
              setImportProgress(Math.round((processed / total) * 100));
            } catch (err) {
              console.error('Error importing breed:', err);
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              setError(`Error importing ${row.name}: ${errorMessage}`);
              hasErrors = true;
              
              const shouldContinue = window.confirm(
                `An error occurred while importing ${row.name}.\n\n` +
                `Error: ${errorMessage}\n\n` +
                `Would you like to continue importing the remaining breeds?`
              );
              
              if (!shouldContinue) {
                throw new Error('Import cancelled by user');
              }
            }
          }

          await refreshBreeds();
          if (!hasErrors) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          }
        } catch (err) {
          console.error('Import error:', err);
          setError(err instanceof Error ? err.message : 'Failed to import breeds');
        } finally {
          setImporting(false);
          setImportProgress(0);
          setImportStatus(null);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setError('Failed to parse CSV file');
        setImporting(false);
        setImportStatus(null);
      }
    });
  };

  const actions = [
    {
      label: 'Download Template',
      icon: <Download className="w-4 h-4" />,
      onClick: handleDownloadTemplate
    },
    {
      label: 'Import CSV',
      icon: <Upload className="w-4 h-4" />,
      isFileInput: true,
      onFileSelect: handleFileUpload
    },
    {
      label: 'Add Breed',
      icon: <Plus className="w-4 h-4" />,
      onClick: () => navigate('/admin/breeds/new')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Breeds</h1>
        <div className="flex items-center gap-4">
          {selectedBreeds.length > 0 && (
            <button
              onClick={() => setBreedToDelete({ id: 'bulk', name: `${selectedBreeds.length} breeds` })}
              className="flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/70"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Selected ({selectedBreeds.length})
            </button>
          )}
          <ActionMenu actions={actions} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search breeds..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Import completed successfully
        </div>
      )}

      {importing && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
          <div className="flex items-center justify-between mb-1">
            <span>Importing breeds...</span>
            <span>{importProgress}%</span>
          </div>
          {importStatus && (
            <p className="mb-2">{importStatus}</p>
          )}
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <BreedList
        breeds={filteredBreeds}
        onEdit={(breed) => navigate(`/admin/breeds/${breed.id}`)}
        onDelete={setBreedToDelete}
        selectedBreeds={selectedBreeds}
        onSelectBreed={handleSelectBreed}
        onSelectAll={handleSelectAll}
      />

      <DeleteConfirmationModal
        isOpen={!!breedToDelete}
        title={breedToDelete?.id === 'bulk' ? "Delete Multiple Breeds" : "Delete Breed"}
        message={
          breedToDelete?.id === 'bulk'
            ? `Are you sure you want to delete ${selectedBreeds.length} breeds? This action cannot be undone.`
            : `Are you sure you want to delete ${breedToDelete?.name}? This action cannot be undone.`
        }
        onConfirm={breedToDelete?.id === 'bulk' ? handleBulkDelete : handleDelete}
        onCancel={() => setBreedToDelete(null)}
        isDeleting={isDeleting}
      />

      <ImportConfirmationModal
        isOpen={importConfirmation.isOpen}
        title="Breed Already Exists"
        message={`A breed named "${importConfirmation.breedName}" already exists. Would you like to update it with the new data?`}
        onConfirm={() => {
          importConfirmation.resolve?.(true);
          setImportConfirmation(prev => ({ ...prev, isOpen: false }));
        }}
        onSkip={() => {
          importConfirmation.resolve?.(false);
          setImportConfirmation(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => {
          importConfirmation.resolve?.(false);
          setImportConfirmation(prev => ({ ...prev, isOpen: false }));
          setImporting(false);
          setImportProgress(0);
        }}
      />
    </div>
  );
};

export default AdminBreeds;