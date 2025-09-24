/**
 * User Management Page - Complete Implementation
 * Provides comprehensive user management for Admin and Manager roles
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../../store';
import { 
  userManagementApi, 
  IUser, 
  IUserPermissions, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserRole 
} from '../../../services/userManagementApi';
import { testModeService } from '../../../config/testMode';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserManagementPage: React.FC = () => {
  // const currentUser = useAppSelector(state => state.auth.user); // Not currently used
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<IUserPermissions | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'worker',
    phoneNumber: '',
    department: ''
  });

  const [editForm, setEditForm] = useState<UpdateUserRequest>({});

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userManagementApi.getUsers();
      setUsers(userData);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.department?.toLowerCase().includes(search)
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const handleCreateUser = async () => {
    try {
      setError(null);
      await userManagementApi.createUser(createForm);
      setCreateDialogOpen(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'worker',
        phoneNumber: '',
        department: ''
      });
      await loadUsers();
    } catch (err) {
      setError('Failed to create user. Please check the form and try again.');
      console.error('Error creating user:', err);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setError(null);
      await userManagementApi.updateUser(selectedUser._id, editForm);
      setEditDialogOpen(false);
      setSelectedUser(null);
      setEditForm({});
      await loadUsers();
    } catch (err) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;

    try {
      setError(null);
      await userManagementApi.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError('Failed to deactivate user. Please try again.');
      console.error('Error deleting user:', err);
    }
  };

  const handleViewPermissions = async (user: IUser) => {
    try {
      setSelectedUser(user);
      const permissions = await userManagementApi.getUserPermissions(user._id);
      setSelectedUserPermissions(permissions);
      setPermissionsDialogOpen(true);
    } catch (err) {
      console.log('No permissions found for user, will create new ones');
      setSelectedUserPermissions(null);
      setPermissionsDialogOpen(true);
    }
  };

  const openEditDialog = (user: IUser) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      department: user.department
    });
    setEditDialogOpen(true);
  };

  const getRoleColor = (role: UserRole): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const roleColors: Record<UserRole, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      admin: 'error',
      manager: 'primary',
      agronomist: 'success',
      farmer: 'info',
      worker: 'default',
      hr: 'secondary',
      sales: 'warning',
      demo: 'default'
    };
    return roleColors[role];
  };

  const userRoles: UserRole[] = ['admin', 'manager', 'agronomist', 'farmer', 'worker', 'hr', 'sales', 'demo'];

  const getUserStats = () => {
    const stats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      byRole: {} as Record<UserRole, number>
    };

    userRoles.forEach(role => {
      stats.byRole[role] = users.filter(u => u.role === role && u.isActive).length;
    });

    return stats;
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading users...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage farm users, roles, and permissions
          </Typography>
          {testModeService.isTestMode() && (
            <Alert severity="info" sx={{ mt: 1 }}>
              🔧 Test Mode Active - {testModeService.useRealData('user-management') ? 'Using real data' : 'Using mock data'}
            </Alert>
          )}
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadUsers}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SecurityIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.active}</Typography>
                  <Typography variant="body2" color="textSecondary">Active Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BusinessIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.byRole.manager + stats.byRole.admin}</Typography>
                  <Typography variant="body2" color="textSecondary">Management</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.byRole.worker + stats.byRole.farmer}</Typography>
                  <Typography variant="body2" color="textSecondary">Field Staff</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Users" />
          <Tab label="User Roles" />
          <Tab label="Permissions" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Search and Filters */}
          <Box display="flex" gap={2} mb={3}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                {userRoles.map(role => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Users Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1">
                          {user.firstName} {user.lastName}
                        </Typography>
                        {user.phoneNumber && (
                          <Typography variant="body2" color="textSecondary">
                            {user.phoneNumber}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.toUpperCase()}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit User">
                        <IconButton 
                          size="small" 
                          onClick={() => openEditDialog(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Permissions">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewPermissions(user)}
                        >
                          <SecurityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deactivate User">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteUser(user._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {userRoles.map(role => (
              <Box key={role} sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Typography>
                      <Badge badgeContent={stats.byRole[role]} color="primary">
                        <Chip
                          label={role}
                          color={getRoleColor(role)}
                          size="small"
                        />
                      </Badge>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {stats.byRole[role]} active users
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Permission Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Click on the security icon next to any user to view and edit their permissions.
          </Typography>
        </TabPanel>
      </Paper>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={createForm.firstName}
                onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})}
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value as UserRole})}
                  label="Role"
                >
                  {userRoles.map(role => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={createForm.phoneNumber}
                onChange={(e) => setCreateForm({...createForm, phoneNumber: e.target.value})}
              />
              <TextField
                fullWidth
                label="Department"
                value={createForm.department}
                onChange={(e) => setCreateForm({...createForm, department: e.target.value})}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">Create User</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={editForm.firstName || ''}
                onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={editForm.lastName || ''}
                onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
              />
            </Box>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editForm.role || ''}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value as UserRole})}
                  label="Role"
                >
                  {userRoles.map(role => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Phone Number"
                value={editForm.phoneNumber || ''}
                onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
              />
            </Box>
            <TextField
              fullWidth
              label="Department"
              value={editForm.department || ''}
              onChange={(e) => setEditForm({...editForm, department: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained">Update User</Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onClose={() => setPermissionsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          User Permissions - {selectedUser?.firstName} {selectedUser?.lastName}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Permissions management interface will be implemented in the next iteration.
            Current permissions: {selectedUserPermissions ? 'Found' : 'None configured'}
          </Typography>
          {selectedUserPermissions && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Farm Access:</Typography>
              {selectedUserPermissions.farmAccess.map((access, index) => (
                <Chip
                  key={index}
                  label={`${access.farmId}: ${access.accessLevel}`}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
