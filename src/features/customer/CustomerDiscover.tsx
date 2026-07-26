import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantService } from '../../services/restaurantService';
import { useLocation } from '../../contexts/LocationContext';
import { Restaurant } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Search, MapPin, Star, Utensils, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const CustomerDiscover: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const cuisines = ['All', 'Maharashtrian', 'North Indian', 'South Indian', 'Chinese', 'Fast Food', 'Desserts'];

  useEffect(() => {
    loadData();
  }, [location, selectedCuisine]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Filter by city (Satara by default or user selected location)
      const city = location.split(',')[0].trim() || 'Satara';
      const cityRest = await RestaurantService.getRestaurantsByCity(city);
      setRestaurants(cityRest);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCuisine =
      selectedCuisine === 'All' ||
      (r.cuisine && r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase()));

    const matchesSearch =
      !searchQuery.trim() ||
      r.restaurant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.address && r.address.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCuisine && matchesSearch;
  });

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
          <h1 className="text-2xl font-extrabold text-slate-900">Discover Restaurants in {location.split(',')[0]}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore authentic local restaurants registered in {location.split(',')[0]}
          </p>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by restaurant name, cuisine or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCuisine === c
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6">
          <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No restaurants registered in {location.split(',')[0]} yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Restaurant owners can sign up and list their establishment to appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredRestaurants.map((place) => (
            <Card
              key={place.id}
              hoverEffect
              onClick={() => navigate(`/customer/restaurant/${place.id}`)}
              className="p-0 overflow-hidden group border border-slate-100 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="relative h-40 bg-slate-200 overflow-hidden">
                  <img
                    src={place.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'}
                    alt={place.restaurant_name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-2xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{place.rating || 4.8}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {place.restaurant_name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{place.cuisine || 'Multi-Cuisine'}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{place.address}</p>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  {place.city || 'Satara'}
                </span>
                <span className="font-bold text-indigo-600 group-hover:underline">
                  Avg {formatCurrency(place.average_cost)} • View Menu & Reserve
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
