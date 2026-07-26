import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurantService';
import { MenuService } from '../../services/menuService';
import { Restaurant, MenuItem } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import {
  Utensils,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Leaf,
  Drumstick,
  Image as ImageIcon,
} from 'lucide-react';

export const BusinessMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState('');

  const categories = ['all', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages', 'Chef Specials'];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rest = await RestaurantService.getRestaurantByOwner(user.id);
      if (rest) {
        setRestaurant(rest);
        const items = await MenuService.getMenuItemsByRestaurant(rest.id);
        setMenuItems(items);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('Main Course');
    setDescription('');
    setPrice('');
    setIsVeg(true);
    setIsAvailable(true);
    setImageUrl('');
    setIngredients('');
    setAllergens('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category || 'Main Course');
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setIsVeg(item.is_veg);
    setIsAvailable(item.is_available);
    setImageUrl(item.image_url || '');
    setIngredients(item.ingredients || '');
    setAllergens(item.allergens || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !name.trim() || !price || isNaN(Number(price))) return;

    setSaving(true);
    try {
      await MenuService.saveMenuItem({
        id: editingItem?.id,
        restaurant_id: restaurant.id,
        name: name.trim(),
        category: category.trim() || 'Main Course',
        description: description.trim(),
        price: Number(price),
        is_veg: isVeg,
        is_available: isAvailable,
        image_url: imageUrl.trim() || undefined,
        ingredients: ingredients.trim() || undefined,
        allergens: allergens.trim() || undefined,
      });
      setIsModalOpen(false);
      await loadData();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      await MenuService.deleteMenuItem(id);
      await loadData();
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const updated = !item.is_available;
    setMenuItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_available: updated } : i))
    );
    await MenuService.toggleAvailability(item.id, updated);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <h1 className="text-2xl font-extrabold text-slate-900">Menu Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, update, or pause dishes served at {restaurant?.restaurant_name || 'your restaurant'}
            </p>
          </div>
        </div>

        <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add New Dish
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading menu dishes...</div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Utensils className="w-8 h-8" />}
          title="No menu items found"
          description="Build your restaurant menu so diners can view dishes and place orders."
          actionLabel="Add First Item"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`p-4 flex flex-col justify-between transition-all ${
                !item.is_available ? 'opacity-65 bg-slate-50/80' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-400">
                    <Utensils className="w-8 h-8" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center p-0.5 shrink-0 ${
                        item.is_veg
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                          : 'border-rose-600 bg-rose-50 text-rose-600'
                      }`}
                      title={item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
                    >
                      {item.is_veg ? <Leaf className="w-2.5 h-2.5" /> : <Drumstick className="w-2.5 h-2.5" />}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 truncate">{item.name}</h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.description || 'No description provided.'}</p>

                  {item.ingredients && (
                    <p className="text-[11px] text-slate-600 mb-1">
                      <strong className="font-semibold text-slate-700">Ingredients:</strong> {item.ingredients}
                    </p>
                  )}

                  {item.allergens && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mb-2 font-medium">
                      ⚠️ Allergens: {item.allergens}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{formatCurrency(item.price)}</span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(item)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    item.is_available
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  {item.is_available ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Paused</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Menu Item' : 'Add New Menu Dish'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Dish Name"
            placeholder="e.g. Truffle Mushroom Tagliatelle"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="Starters">Starters</option>
                <option value="Main Course">Main Course</option>
                <option value="Breads">Breads</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
                <option value="Chef Specials">Chef Specials</option>
              </select>
            </div>

            <Input
              label="Price (₹ INR)"
              type="number"
              placeholder="450"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of ingredients, preparation style or flavor profile"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Key Ingredients (Optional)"
              placeholder="e.g. Paneer, Butter, Spices, Tomato"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            <Input
              label="Allergen Info (Optional)"
              placeholder="e.g. Contains Dairy, Nuts, Gluten"
              value={allergens}
              onChange={(e) => setAllergens(e.target.value)}
            />
          </div>

          <Input
            label="Dish Image URL (Optional)"
            placeholder="https://images.unsplash.com/photo-..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            icon={<ImageIcon className="w-4 h-4" />}
          />

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-800">Dietary Type</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVeg(true)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  isVeg ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Leaf className="w-3 h-3" /> Veg
              </button>
              <button
                type="button"
                onClick={() => setIsVeg(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  !isVeg ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Drumstick className="w-3 h-3" /> Non-Veg
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-800">Available to Order</span>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {isAvailable ? 'In Stock' : 'Paused / Out of Stock'}
            </button>
          </div>

          <Button type="submit" loading={saving} className="w-full mt-2">
            {editingItem ? 'Save Item Changes' : 'Add Dish to Menu'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
