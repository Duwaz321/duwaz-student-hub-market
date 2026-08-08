import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStudent, useUpdateStudent } from '@/hooks/useStudents';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, transactionsApi, rewardsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING:   'bg-yellow-100 text-yellow-800',
  FAILED:    'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED:  'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
};

const AccountPage = () => {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const CURRENT_STUDENT_ID = user?.userId ?? 0;
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: student, isLoading: studentLoading } = useStudent(CURRENT_STUDENT_ID);
  const { mutate: updateStudent, isPending: isSaving } = useUpdateStudent();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'student', CURRENT_STUDENT_ID],
    queryFn: () => ordersApi.getByStudent(CURRENT_STUDENT_ID),
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['transactions', 'student', CURRENT_STUDENT_ID],
    queryFn: () => transactionsApi.getByStudent(CURRENT_STUDENT_ID),
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards'],
    queryFn: rewardsApi.getAll,
  });

  const [editForm, setEditForm] = useState({
    studentName: '',
    studentNumber: '',
    locationAddress: '',
    profileImage: null as string | null,
  });

  const handleEditClick = () => {
    if (student) {
      setEditForm({
        studentName:     student.studentName ?? '',
        studentNumber:   student.studentNumber ?? '',
        locationAddress: student.locationAddress ?? '',
        profileImage:    student.profileImage ?? null,
      });
    }
    setIsEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Image must be smaller than 2MB', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm(prev => ({ ...prev, profileImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setEditForm(prev => ({ ...prev, profileImage: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = () => {
    if (!student) return;
    updateStudent(
      {
        ...student,
        studentName:     editForm.studentName,
        studentNumber:   editForm.studentNumber,
        locationAddress: editForm.locationAddress,
        profileImage:    editForm.profileImage ?? undefined,
      } as any,
      {
        onSuccess: (saved) => {
          setIsEditing(false);
          // Push profileImage (and name) into AuthContext so Navbar updates instantly
          updateUser({
            studentName: saved.studentName ?? user?.studentName,
            profileImage: (saved as any).profileImage ?? undefined,
          });
          toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
        },
        onError: (err) => {
          toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  const initials = student?.studentName
    ? student.studentName.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?';

  // Current profile picture — in edit mode show preview, otherwise show saved
  const displayImage = isEditing ? editForm.profileImage : student?.profileImage;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">

        {/* ── Summary Card ── */}
        <Card className="md:w-1/3">
          <CardHeader>
            {/* Avatar with camera overlay */}
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-2 ring-duwaz-brown/20">
                  {displayImage && <AvatarImage src={displayImage} alt={student?.studentName} className="object-cover" />}
                  <AvatarFallback className="text-2xl bg-duwaz-brown text-white">
                    {studentLoading ? '...' : initials}
                  </AvatarFallback>
                </Avatar>

                {/* Camera button — always visible, opens file picker and auto-enters edit mode */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditing) handleEditClick();
                    setTimeout(() => fileInputRef.current?.click(), 50);
                  }}
                  className="absolute bottom-0 right-0 bg-duwaz-brown text-white rounded-full p-1.5 shadow hover:bg-duwaz-brown/80 transition-colors"
                  aria-label="Change profile picture"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <CardTitle className="text-center">
              {studentLoading ? 'Loading...' : (student?.studentName ?? 'Student')}
            </CardTitle>
            <CardDescription className="text-center">
              {student?.studentNumber ?? ''}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orders</span>
                <span>{orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transactions</span>
                <span>{transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rewards</span>
                <span>{rewards.length}</span>
              </div>
              {student?.locationAddress && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground text-xs">Location</p>
                  <p className="text-sm font-medium">{student.locationAddress}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* ── Tabs ── */}
        <div className="flex-1">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
            </TabsList>

            {/* ── Profile tab ── */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your name, student number, location and profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {studentLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />)}
                    </div>
                  ) : (
                    <>
                      {/* Profile picture section */}
                      {isEditing && (
                        <div>
                          <Label className="mb-2 block">Profile Picture</Label>
                          <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 flex-shrink-0">
                              {editForm.profileImage ? (
                                <>
                                  <img
                                    src={editForm.profileImage}
                                    alt="Preview"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-duwaz-brown"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </>
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl font-bold text-gray-400">
                                  {initials}
                                </div>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-gray-500">
                              <p>Max 2MB — JPG, PNG or WebP.</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="h-3.5 w-3.5 mr-1.5" />
                                {editForm.profileImage ? 'Change Photo' : 'Upload Photo'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Full Name */}
                      <div className="space-y-1">
                        <Label htmlFor="studentName">Full Name</Label>
                        <Input
                          id="studentName"
                          value={isEditing ? editForm.studentName : (student?.studentName ?? '')}
                          onChange={(e) => setEditForm(p => ({ ...p, studentName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>

                      {/* Student Number */}
                      <div className="space-y-1">
                        <Label htmlFor="studentNumber">Student Number</Label>
                        <Input
                          id="studentNumber"
                          value={isEditing ? editForm.studentNumber : (student?.studentNumber ?? '')}
                          onChange={(e) => setEditForm(p => ({ ...p, studentNumber: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>

                      {/* Location Address */}
                      <div className="space-y-1">
                        <Label htmlFor="locationAddress">Location Address</Label>
                        <Input
                          id="locationAddress"
                          placeholder="e.g. Room 204, Res Block B"
                          value={isEditing ? editForm.locationAddress : (student?.locationAddress ?? '')}
                          onChange={(e) => setEditForm(p => ({ ...p, locationAddress: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  {isEditing ? (
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-duwaz-brown hover:bg-duwaz-brown/90"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={handleEditClick} disabled={!student}>
                      Edit Profile
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            {/* ── Orders ── */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>Your placed orders.</CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 animate-pulse rounded" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">Order #{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.orderDate).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm">Total: R{Number(order.totalAmount).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Transactions ── */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>All your payment transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                  {txLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No transactions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center py-3 border-b last:border-0">
                          <div>
                            <p className="font-medium">{tx.product?.name ?? `Transaction #${tx.id}`}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.transactionDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">R{Number(tx.amount).toFixed(2)}</p>
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${statusColors[tx.status] ?? 'bg-gray-100 text-gray-800'}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Rewards ── */}
            <TabsContent value="rewards">
              <Card>
                <CardHeader>
                  <CardTitle>Rewards Catalog</CardTitle>
                  <CardDescription>Available rewards you can earn.</CardDescription>
                </CardHeader>
                <CardContent>
                  {rewards.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No rewards available yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {rewards.map((reward) => (
                        <div key={reward.id} className="flex justify-between items-center border rounded-md p-4">
                          <div>
                            <p className="font-medium">{reward.name}</p>
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-duwaz-brown">{reward.points} pts</p>
                            <Button size="sm" variant="outline" className="mt-1">Redeem</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
