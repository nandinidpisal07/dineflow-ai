import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurantService';
import { ROUTES } from '../../constants/routes';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Store, MapPin, Phone, Mail, Clock, DollarSign, Sparkles, ArrowLeft, Image as ImageIcon, Users } from 'lucide-react';

export const BusinessSetupWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [restaurantName, setRestaurantName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [openingTime, setOpeningTime] = useState('11:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [averageCost, setAverageCost] = useState(700);
  const [tableCapacity, setTableCapacity] = useState(40);
  const [imagesText, setImagesText] = useState('');

  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    if (user) {
      RestaurantService.getRestaurantByOwner(user.id).then((rest) => {
        if (rest) {
          navigate(ROUTES.BUSINESS_HOME);
        } else {
          setCheckingExisting(false);
        }
      });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const parsedImages = imagesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await RestaurantService.saveRestaurant({
        owner_id: user.id,
        restaurant_name: restaurantName,
        description,
        logo: logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
        cover_image: coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        cuisine,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        opening_time: openingTime,
        closing_time: closingTime,
        average_cost: averageCost,
        table_capacity: tableCapacity,
        images: parsedImages.length > 0 ? parsedImages : [coverImage].filter(Boolean),
        rating: 4.8,
        distance_km: 1.0,
        is_open: true,
      });

      navigate(ROUTES.BUSINESS_HOME);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return <div className="py-12 text-center text-xs text-slate-500">Checking restaurant account...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-10 space-y-6 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Setup Your Restaurant Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete all details below to launch your restaurant dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Restaurant Name *"
              placeholder="e.g. Satara Delights"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              icon={<Store className="w-4 h-4" />}
              required
            />
            <Input
              label="Cuisine Categories *"
              placeholder="e.g. Maharashtrian, North Indian, Thali"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Description *
            </label>
            <textarea
              rows={3}
              placeholder="Describe your signature dishes, history, and dining experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Logo Image URL"
              placeholder="https://..."
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              icon={<ImageIcon className="w-4 h-4" />}
            />
            <Input
              label="Cover Image URL"
              placeholder="https://..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              icon={<ImageIcon className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Street Address *"
            placeholder="e.g. Powai Naka, Near Bus Stand"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            icon={<MapPin className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City *"
              placeholder="e.g. Satara"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              label="State *"
              placeholder="e.g. Maharashtra"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
            <Input
              label="PIN Code *"
              placeholder="e.g. 415001"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="owner@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              label="Opening Hours *"
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              required
            />
            <Input
              label="Closing Hours *"
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              required
            />
            <Input
              label="Avg Cost for Two (₹) *"
              type="number"
              value={averageCost}
              onChange={(e) => setAverageCost(parseInt(e.target.value, 10) || 0)}
              required
            />
            <Input
              label="Table Capacity *"
              type="number"
              value={tableCapacity}
              onChange={(e) => setTableCapacity(parseInt(e.target.value, 10) || 0)}
              icon={<Users className="w-4 h-4" />}
              required
            />
          </div>

          <Input
            label="Additional Image URLs (Comma separated)"
            placeholder="https://img1.jpg, https://img2.jpg"
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
          />

          <Button type="submit" loading={loading} size="lg" className="w-full mt-4">
            Save & Activate Restaurant Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
};
