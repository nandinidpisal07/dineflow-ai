import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurantService';
import { Restaurant } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { formatTime, formatCurrency } from '../../utils/formatters';
import { Store, MapPin, Phone, Mail, Clock, Edit2, LogOut, ArrowLeft, Users, Image as ImageIcon } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const BusinessProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [avgCost, setAvgCost] = useState(500);
  const [tableCapacity, setTableCapacity] = useState(30);
  const [imagesText, setImagesText] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      RestaurantService.getRestaurantByOwner(user.id).then((rest) => {
        if (rest) {
          setRestaurant(rest);
          setName(rest.restaurant_name || '');
          setDescription(rest.description || '');
          setLogo(rest.logo || '');
          setCoverImage(rest.cover_image || '');
          setCuisine(rest.cuisine || '');
          setAddress(rest.address || '');
          setCity(rest.city || '');
          setState(rest.state || '');
          setPincode(rest.pincode || '');
          setPhone(rest.phone || '');
          setEmail(rest.email || user.email || '');
          setOpeningTime(rest.opening_time || '11:00');
          setClosingTime(rest.closing_time || '23:00');
          setAvgCost(rest.average_cost || 500);
          setTableCapacity(rest.table_capacity || 30);
          setImagesText((rest.images || []).join(', '));
        }
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const parsedImages = imagesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await RestaurantService.saveRestaurant({
        id: restaurant?.id,
        owner_id: user.id,
        restaurant_name: name,
        description,
        logo,
        cover_image: coverImage,
        cuisine,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        opening_time: openingTime,
        closing_time: closingTime,
        average_cost: avgCost,
        table_capacity: tableCapacity,
        images: parsedImages,
        rating: restaurant?.rating || 4.8,
        distance_km: restaurant?.distance_km || 1.0,
        is_open: true,
      });

      setRestaurant(updated);
      setIsEditModalOpen(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="py-12 text-center max-w-lg mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <Store className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Restaurant Profile Created</h2>
        <p className="text-xs text-slate-500">
          You have not created a restaurant profile yet. Set up your restaurant profile to activate your dashboard.
        </p>
        <Button onClick={() => navigate(ROUTES.BUSINESS_SETUP)} className="w-full">
          Create Restaurant Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div className="flex items-center justify-between">
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
            <h1 className="text-2xl font-extrabold text-slate-900">Restaurant Settings & Profile</h1>
            <p className="text-xs text-slate-500 mt-0.5">Edit public information, operational timings, and contact details</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            icon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Profile
          </Button>
          <Button variant="danger" size="sm" onClick={signOut} icon={<LogOut className="w-3.5 h-3.5" />}>
            Sign Out
          </Button>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        {/* Banner + Logo header */}
        <div className="relative rounded-2xl overflow-hidden h-40 bg-slate-100 border border-slate-200">
          <img
            src={restaurant.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <img
              src={restaurant.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80'}
              alt="Logo"
              className="w-14 h-14 rounded-2xl border-2 border-white object-cover bg-white shadow-md"
            />
            <div className="text-white">
              <h2 className="text-xl font-extrabold">{restaurant.restaurant_name}</h2>
              <Badge variant="purple" size="sm" className="mt-0.5">
                {restaurant.cuisine}
              </Badge>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">City & State</span>
            <p className="font-semibold text-slate-800">{restaurant.city}{restaurant.state ? `, ${restaurant.state}` : ''} {restaurant.pincode && `(${restaurant.pincode})`}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Full Address</span>
            <p className="font-semibold text-slate-800">{restaurant.address}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone & Email</span>
            <p className="font-semibold text-slate-800">{restaurant.phone}</p>
            {restaurant.email && <p className="text-slate-500 text-[11px]">{restaurant.email}</p>}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Opening & Closing Hours</span>
            <p className="font-semibold text-slate-800">
              {formatTime(restaurant.opening_time)} - {formatTime(restaurant.closing_time)}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Cost For Two</span>
            <p className="font-semibold text-slate-800">{formatCurrency(restaurant.average_cost)}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Table Capacity</span>
            <p className="font-semibold text-slate-800">{restaurant.table_capacity || 30} Guests</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Description</span>
          <p className="text-xs text-slate-700 leading-relaxed">{restaurant.description}</p>
        </div>

        {restaurant.images && restaurant.images.length > 0 && (
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Gallery Images</span>
            <div className="grid grid-cols-3 gap-2">
              {restaurant.images.map((img, idx) => (
                <img key={idx} src={img} alt={`Gallery ${idx}`} className="w-full h-24 object-cover rounded-xl border border-slate-200" />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Restaurant Information"
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Restaurant Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Cuisine Categories" value={cuisine} onChange={(e) => setCuisine(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Logo URL" value={logo} onChange={(e) => setLogo(e.target.value)} />
            <Input label="Cover Image URL" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
          </div>

          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
            <Input label="PIN Code" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Contact Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <Input label="Contact Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input label="Opening Time" type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} required />
            <Input label="Closing Time" type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} required />
            <Input label="Avg Cost (₹)" type="number" value={avgCost} onChange={(e) => setAvgCost(parseInt(e.target.value, 10) || 0)} required />
            <Input label="Table Capacity" type="number" value={tableCapacity} onChange={(e) => setTableCapacity(parseInt(e.target.value, 10) || 0)} required />
          </div>

          <Input label="Gallery Images (comma separated)" value={imagesText} onChange={(e) => setImagesText(e.target.value)} />

          <Button type="submit" loading={saving} className="w-full mt-2">
            Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
};
