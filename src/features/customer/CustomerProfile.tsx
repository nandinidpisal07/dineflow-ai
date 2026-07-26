import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { User, Phone, MapPin, Home, LogOut, Edit2, ArrowLeft, Camera } from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, updateProfile } = useAuth();
  const { location, setLocation } = useLocation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [userLocation, setUserLocation] = useState(user?.location || location || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.delivery_address || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        profile_image: profileImage.trim() || undefined,
        location: userLocation.trim(),
        delivery_address: deliveryAddress.trim(),
      });
      if (userLocation.trim()) {
        setLocation(userLocation.trim());
      }
      setIsEditModalOpen(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Customer Account</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage personal profile details and contact preferences</p>
        </div>
      </div>

      <Card className="p-6 text-center space-y-4">
        <div className="relative inline-block mx-auto">
          <Avatar name={user?.full_name || 'Customer'} src={user?.profile_image} size="xl" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{user?.full_name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs">
          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
            <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Phone Number</span>
              <span className="font-semibold text-slate-800">{user?.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">City / Location</span>
              <span className="font-semibold text-slate-800">{user?.location || location || 'Not set'}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 sm:col-span-2">
            <Home className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Delivery Address</span>
              <span className="font-semibold text-slate-800">{user?.delivery_address || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFullName(user?.full_name || '');
              setPhone(user?.phone || '');
              setProfileImage(user?.profile_image || '');
              setUserLocation(user?.location || location || '');
              setDeliveryAddress(user?.delivery_address || '');
              setIsEditModalOpen(true);
            }}
            icon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Profile
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={signOut}
            icon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Customer Profile"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Profile Picture URL"
            placeholder="https://example.com/avatar.jpg"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            icon={<Camera className="w-4 h-4" />}
          />
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            icon={<User className="w-4 h-4" />}
          />
          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-4 h-4" />}
          />
          <Input
            label="City / Location"
            placeholder="e.g. Bengaluru, KA or Indiranagar"
            value={userLocation}
            onChange={(e) => setUserLocation(e.target.value)}
            icon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="Delivery Address"
            placeholder="Door No, Street Name, Landmark"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            icon={<Home className="w-4 h-4" />}
          />
          <Button type="submit" loading={saving} className="w-full mt-2">
            Save Profile Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
};
